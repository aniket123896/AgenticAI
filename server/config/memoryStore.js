import mingo from 'mingo';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

// In-Memory Data Collections
const store = {
  users: [],
  departments: [],
  staffs: [],
  complaints: [],
  comments: [],
  feedbacks: [],
  complainthistories: []
};

export const getStore = () => store;

export const resetStore = () => {
  for (const key of Object.keys(store)) {
    store[key] = [];
  }
};

export const generateId = () => {
  return new crypto.randomBytes(12).toString('hex');
};

export const isObjectId = (val) => {
  if (!val) return false;
  const str = String(val);
  return /^[0-9a-fA-F]{24}$/.test(str);
};

export class MemoryModel {
  constructor(collectionName, schemaDef = {}) {
    this.collectionName = collectionName;
    this.schemaDef = schemaDef;
  }

  get collection() {
    if (!store[this.collectionName]) {
      store[this.collectionName] = [];
    }
    return store[this.collectionName];
  }

  async create(doc) {
    const _id = doc._id || generateId();
    const now = new Date();

    let password = doc.password;
    if (password && !password.startsWith('$2')) {
      const salt = await bcrypt.genSalt(10);
      password = await bcrypt.hash(password, salt);
    }

    const newDoc = {
      ...doc,
      _id: String(_id),
      password,
      createdAt: doc.createdAt || now,
      updatedAt: doc.updatedAt || now
    };

    // Attach prototype methods if user
    if (this.collectionName === 'users') {
      newDoc.matchPassword = async function (entered) {
        return await bcrypt.compare(entered, this.password);
      };
    }

    this.collection.push(newDoc);
    return this.wrapDoc(newDoc);
  }

  async insertMany(docs) {
    const results = [];
    for (const d of docs) {
      const created = await this.create(d);
      results.push(created);
    }
    return results;
  }

  wrapDoc(rawDoc) {
    if (!rawDoc) return null;
    const model = this;
    const docObj = { ...rawDoc };

    docObj.save = async function () {
      docObj.updatedAt = new Date();
      const idx = model.collection.findIndex((item) => String(item._id) === String(docObj._id));
      if (idx !== -1) {
        model.collection[idx] = { ...docObj };
      } else {
        model.collection.push({ ...docObj });
      }
      return model.wrapDoc(docObj);
    };

    docObj.deleteOne = async function () {
      const idx = model.collection.findIndex((item) => String(item._id) === String(docObj._id));
      if (idx !== -1) {
        model.collection.splice(idx, 1);
      }
      return true;
    };

    docObj.populate = async function (popFields) {
      await model.populateDocs([docObj], popFields);
      return docObj;
    };

    if (model.collectionName === 'users') {
      docObj.matchPassword = async function (entered) {
        return await bcrypt.compare(entered, this.password);
      };
    }

    return docObj;
  }

  find(query = {}) {
    return new MemoryQuery(this, query, 'find');
  }

  findOne(query = {}) {
    return new MemoryQuery(this, query, 'findOne');
  }

  findById(id) {
    return new MemoryQuery(this, { _id: String(id) }, 'findOne');
  }

  async countDocuments(query = {}) {
    const q = new MemoryQuery(this, query, 'find');
    const results = await q.exec();
    return results.length;
  }

  async deleteMany(query = {}) {
    const q = new MemoryQuery(this, query, 'find');
    const matched = await q.exec();
    const matchedIds = new Set(matched.map((m) => String(m._id)));
    store[this.collectionName] = this.collection.filter((doc) => !matchedIds.has(String(doc._id)));
    return { deletedCount: matched.length };
  }

  async updateMany(query = {}, update = {}) {
    const q = new MemoryQuery(this, query, 'find');
    const matched = await q.exec();
    matched.forEach((doc) => {
      if (update.$set) {
        Object.assign(doc, update.$set);
      }
      doc.updatedAt = new Date();
    });
    return { modifiedCount: matched.length };
  }

  async aggregate(pipeline = []) {
    const mingoQuery = new mingo.Aggregator(pipeline);
    const results = mingoQuery.run(this.collection);
    return results;
  }

  async populateDocs(docs, populateOptions) {
    if (!docs || docs.length === 0 || !populateOptions) return docs;

    const popList = Array.isArray(populateOptions) ? populateOptions : [populateOptions];

    for (const pop of popList) {
      const field = typeof pop === 'string' ? pop : pop.path;
      const selectFields = typeof pop === 'object' && pop.select ? pop.select.split(' ') : null;

      for (const doc of docs) {
        // Handle nested paths (e.g. 'resolutionDetails.resolvedBy')
        let targetValue = null;
        let parentObj = doc;
        let targetKey = field;

        if (field.includes('.')) {
          const parts = field.split('.');
          parentObj = doc[parts[0]];
          targetKey = parts[1];
          targetValue = parentObj ? parentObj[targetKey] : null;
        } else {
          targetValue = doc[field];
        }

        if (!targetValue) continue;

        let targetModelName = null;
        if (field === 'submittedBy' || field === 'user' || field === 'student' || field.endsWith('resolvedBy')) {
          targetModelName = 'users';
        } else if (field === 'assignedDepartment' || field === 'department') {
          targetModelName = 'departments';
        } else if (field === 'assignedStaff') {
          targetModelName = 'staffs';
        } else if (field === 'complaint') {
          targetModelName = 'complaints';
        } else if (field === 'feedback') {
          targetModelName = 'feedbacks';
        }

        if (targetModelName && store[targetModelName]) {
          const found = store[targetModelName].find(
            (item) => String(item._id) === String(targetValue._id || targetValue)
          );
          if (found) {
            let populatedVal = { ...found };
            if (selectFields && selectFields.length > 0) {
              const pruned = { _id: populatedVal._id };
              selectFields.forEach((f) => {
                if (f && !f.startsWith('-') && populatedVal[f] !== undefined) {
                  pruned[f] = populatedVal[f];
                }
              });
              populatedVal = pruned;
            }
            if (parentObj) {
              parentObj[targetKey] = populatedVal;
            }
          }
        }
      }
    }
    return docs;
  }
}

export class MemoryQuery {
  constructor(model, query = {}, queryType = 'find') {
    this.model = model;
    this.queryObj = query || {};
    this.queryType = queryType;
    this.sortOptions = null;
    this.skipCount = 0;
    this.limitCount = null;
    this.populateConfigs = [];
    this.selectedFields = null;
    this.isLean = false;
  }

  sort(options) {
    this.sortOptions = options;
    return this;
  }

  skip(count) {
    this.skipCount = count;
    return this;
  }

  limit(count) {
    this.limitCount = count;
    return this;
  }

  populate(options) {
    if (options) {
      if (Array.isArray(options)) {
        this.populateConfigs.push(...options);
      } else {
        this.populateConfigs.push(options);
      }
    }
    return this;
  }

  select(fields) {
    this.selectedFields = fields;
    return this;
  }

  lean() {
    this.isLean = true;
    return this;
  }

  async exec() {
    // Sanitize query keys (e.g. ObjectId cast or regex)
    const sanitizedQuery = { ...this.queryObj };
    for (const key of Object.keys(sanitizedQuery)) {
      if (sanitizedQuery[key] && sanitizedQuery[key].$regex) {
        // regex object
      } else if (key === '_id' || key.endsWith('By') || key.endsWith('Department') || key.endsWith('Staff') || key === 'complaint' || key === 'student') {
        if (sanitizedQuery[key] && typeof sanitizedQuery[key] === 'object' && sanitizedQuery[key]._id) {
          sanitizedQuery[key] = String(sanitizedQuery[key]._id);
        } else if (sanitizedQuery[key]) {
          sanitizedQuery[key] = String(sanitizedQuery[key]);
        }
      }
    }

    const mingoQuery = new mingo.Query(sanitizedQuery);
    let matched = mingoQuery.find(this.model.collection).all();

    // Sort
    if (this.sortOptions) {
      const sortKeys = Object.keys(this.sortOptions);
      matched.sort((a, b) => {
        for (const k of sortKeys) {
          const dir = this.sortOptions[k];
          const valA = a[k];
          const valB = b[k];
          if (valA < valB) return dir === 1 ? -1 : 1;
          if (valA > valB) return dir === 1 ? 1 : -1;
        }
        return 0;
      });
    }

    // Skip
    if (this.skipCount > 0) {
      matched = matched.slice(this.skipCount);
    }

    // Limit
    if (this.limitCount !== null && this.limitCount !== undefined) {
      matched = matched.slice(0, this.limitCount);
    }

    // Populate
    if (this.populateConfigs.length > 0) {
      await this.model.populateDocs(matched, this.populateConfigs);
    }

    if (this.queryType === 'findOne') {
      const first = matched[0] || null;
      return this.isLean ? first : this.model.wrapDoc(first);
    }

    return this.isLean ? matched : matched.map((doc) => this.model.wrapDoc(doc));
  }

  then(resolve, reject) {
    return this.exec().then(resolve, reject);
  }
}
