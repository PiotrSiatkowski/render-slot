// src/renderSlot.ts
import isFunction from "lodash.isfunction";
import isPlainObject from "lodash.isplainobject";
import {
  cloneElement,
  createElement,
  isValidElement
} from "react";
function renderSlot(...args) {
  switch (args.length) {
    case 1:
      return renderSlotWithObject(args[0]);
    case 2:
      return renderSlotWithObject({
        bespoke: args[0],
        ...isPlainObject(args[1]) && !isValidElement(args[1]) ? args[1] : { default: args[1] }
      });
    case 3:
      return renderSlotWithObject({
        bespoke: args[0],
        default: args[1],
        ...isFunction(args[2]) ? { wrapper: args[2] } : args[2]
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
  return isPlainObject(obj);
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
      return isFunction(defaultPart) ? createElement(defaultPart, {}) : defaultPart ?? null;
    }
    if (isFunction(bespokePart)) {
      return bespokePart(
        isFunction(defaultPart) ? defaultPart : isValidElement(defaultPart) ? (props) => cloneElement(defaultPart, props) : () => null
      );
    }
    if (wrapNonElementWithDefault && !isObject(bespokePart)) {
      return isFunction(defaultPart) ? createElement(defaultPart, { children: bespokePart }) : isValidElement(defaultPart) ? cloneElement(defaultPart, { children: bespokePart }) : null;
    }
    if (isObject(bespokePart) && !isValidElement(bespokePart)) {
      return isFunction(defaultPart) ? createElement(defaultPart, bespokePart) : isValidElement(defaultPart) ? cloneElement(defaultPart, bespokePart) : null;
    }
    return bespokePart;
  };
  return wrapperPart ? wrapperPart(renderContent()) : renderContent();
}
export {
  renderSlot
};
