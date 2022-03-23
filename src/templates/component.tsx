import type { COMPONENT_NAMEProps } from "./COMPONENT_NAME.types";
import { utilCOMPONENT_NAME } from "./COMPONENT_NAME.utils";
import useCOMPONENT_NAME from "./useCOMPONENT_NAME.hook";
import content from "./COMPONENT_NAME.content.en.json";

export default function COMPONENT_NAME(props: COMPONENT_NAMEProps) {
  const utilData = utilCOMPONENT_NAME({ foo: "bar" });
  const hookData = useCOMPONENT_NAME();
  console.log({ utilData, hookData, props, content });
  return (
    <div>
      <h2>{content.headline}</h2>
      <p>{content.nested.hello}</p>
    </div>
  );
}
