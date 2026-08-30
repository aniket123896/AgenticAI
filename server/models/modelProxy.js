import { isInMemoryMode } from '../config/db.js';

export const createModelProxy = (mongooseModel, memoryModel) => {
  return new Proxy(mongooseModel, {
    get(target, prop, receiver) {
      if (isInMemoryMode()) {
        const memProp = memoryModel[prop];
        if (typeof memProp === 'function') {
          return memProp.bind(memoryModel);
        }
        if (memProp !== undefined) {
          return memProp;
        }
      }
      const val = Reflect.get(target, prop, receiver);
      if (typeof val === 'function') {
        return val.bind(target);
      }
      return val;
    }
  });
};
