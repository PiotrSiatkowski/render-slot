"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  renderSlot: () => renderSlot
});
module.exports = __toCommonJS(index_exports);

// src/renderSlot.ts
var import_lodash = __toESM(require("lodash.isfunction"), 1);
var import_lodash2 = __toESM(require("lodash.isplainobject"), 1);
var import_react = require("react");
function renderSlot(...args) {
  switch (args.length) {
    case 1:
      return renderSlotWithObject(args[0]);
    case 2:
      return renderSlotWithObject({
        bespoke: args[0],
        ...(0, import_lodash2.default)(args[1]) && !(0, import_react.isValidElement)(args[1]) ? args[1] : { default: args[1] }
      });
    case 3:
      return renderSlotWithObject({
        bespoke: args[0],
        default: args[1],
        ...(0, import_lodash.default)(args[2]) ? { wrapper: args[2] } : args[2]
      });
    case 4:
      return renderSlotWithObject({
        bespoke: args[0],
        default: args[1],
        wrapper: args[2],
        options: args[3]
      });
  }
}
function isObject(obj) {
  return (0, import_lodash2.default)(obj);
}
function renderSlotWithObject({
  bespoke: bespokePart,
  default: defaultPart,
  wrapper: wrapperPart,
  options: optionsPart
}) {
  const { wrapNonElementWithDefault } = optionsPart ?? {};
  if (bespokePart === void 0 || bespokePart === false || bespokePart === null) {
    return null;
  }
  const renderContent = () => {
    if (bespokePart === true) {
      return (0, import_lodash.default)(defaultPart) ? (0, import_react.createElement)(defaultPart, {}) : defaultPart ?? null;
    }
    if ((0, import_lodash.default)(bespokePart)) {
      return bespokePart(
        (0, import_lodash.default)(defaultPart) ? defaultPart : (0, import_react.isValidElement)(defaultPart) ? (props) => (0, import_react.cloneElement)(defaultPart, props) : () => null
      );
    }
    if (wrapNonElementWithDefault && !isObject(bespokePart)) {
      return (0, import_lodash.default)(defaultPart) ? (0, import_react.createElement)(defaultPart, { children: bespokePart }) : (0, import_react.isValidElement)(defaultPart) ? (0, import_react.cloneElement)(defaultPart, { children: bespokePart }) : null;
    }
    if (isObject(bespokePart) && !(0, import_react.isValidElement)(bespokePart)) {
      return (0, import_lodash.default)(defaultPart) ? (0, import_react.createElement)(defaultPart, bespokePart) : (0, import_react.isValidElement)(defaultPart) ? (0, import_react.cloneElement)(defaultPart, bespokePart) : null;
    }
    return bespokePart;
  };
  return wrapperPart ? wrapperPart(renderContent()) : renderContent();
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  renderSlot
});
