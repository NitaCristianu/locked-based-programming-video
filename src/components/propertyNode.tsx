import { initial, Node, NodeProps, signal } from "@motion-canvas/2d";
import { SignalValue, SimpleSignal } from "@motion-canvas/core";

export interface PropsNodeProps extends NodeProps {
  customprops?: SignalValue<Record<string, any>>;
}

export class PropsNode extends Node {
  public declare readonly customprops: Record<string, any>;

  public constructor(props?: PropsNodeProps) {
    super({
        ...props,
    });
    this.customprops = props.customprops;
    
  }
}
