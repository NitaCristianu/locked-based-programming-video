import { all, Color, createRef, createSignal, delay, easeOutCubic, PossibleColor, Reference, SignalValue, SimpleSignal, Vector2 } from "@motion-canvas/core";
import { GMRect, GMRectProps } from "./glassmorphic_rect";
import { Circle, Gradient, initial, Node, signal, Txt } from "@motion-canvas/2d";

type value_type = "64bit int" | "bool" | "32bit int";
export interface ObjectValueProps extends GMRectProps {
    name?: SignalValue<string>;
    value?: SignalValue<number | boolean>;
    type?: SignalValue<value_type | string>;
    focusName?: SignalValue<number>;
    darkmode?: SignalValue<number>;
}

export class ObjectValue extends GMRect {

    @initial("X")
    @signal()
    public declare readonly name: SimpleSignal<string, this>;

    @initial(0)
    @signal()
    public declare readonly focusName: SimpleSignal<number, this>;

    @initial("32bit int")
    @signal()
    public declare readonly type: SimpleSignal<value_type | string, this>;

    @initial(0)
    @signal()
    public declare readonly value: SimpleSignal<number | boolean, this>;

    @initial(0)
    @signal()
    public declare readonly darkmode: SimpleSignal<number, this>;

    private readonly infoRef: Reference<Txt> = createRef();
    private readonly toggleCircle: Reference<Circle> = createRef();

    public constructor(props?: ObjectValueProps) {
        super({
            radius: 999,
            size: 200,
            ...props,
        });
        const colorcomp = ()=> 255 - this.darkmode()*255;
        const fullColor = ()=>new Color(`rgb(${colorcomp()},${colorcomp()},${colorcomp()})`);

        if (typeof (this.value()) == 'boolean') this.type("bool");
        this.add(<Node>
            <Txt
                fontSize={() => 90 * this.size().x / 200}
                zIndex={1}
                fontFamily={"Poppins"}
                shadowBlur={20}
                shadowColor={fullColor}
                opacity={this.focusName}
                text={this.name}
                fill={()=>new Gradient({
                    toY: 40,
                    fromY: -40,
                    stops: [
                        { offset: 0.0, color: new Color(fullColor()).alpha(0) },
                        { offset: 0.2, color: fullColor() },
                        { offset: 0.8, color: fullColor() },
                        { offset: 1, color: new Color(fullColor()).alpha(0) }
                    ]
                })}
            />
            <Txt
                fontSize={() => 90 * this.size().x / 200}
                zIndex={1}
                fontFamily={"Fira Code"}
                shadowBlur={20}
                shadowColor={fullColor()}
                opacity={() => 1 - this.focusName()}
                text={() => {
                    const v = this.value();
                    if (typeof (v) == "boolean")
                        return v ? '1' : '0';
                    return v.toFixed(0);
                }}
                fill={()=>new Gradient({
                    toY: 40,
                    fromY: -40,
                    stops: [
                        { offset: 0.0, color: new Color(fullColor()).alpha(0) },
                        { offset: 0.2, color: fullColor() },
                        { offset: 0.8, color: fullColor() },
                        { offset: 1, color: new Color(fullColor()).alpha(0) }
                    ]
                })}
            />
            <Txt
                fontSize={() => 20 * this.size().x / 200}
                zIndex={1}
                fontFamily={"Fira Code"}
                shadowBlur={20}
                shadowColor={fullColor}
                text={this.type}
                textAlign={'center'}
                letterSpacing={-1}
                opacity={.8}
                y={50}
                fill={()=>new Gradient({
                    toY: 40,
                    fromY: -40,
                    stops: [
                        { offset: 0.0, color: new Color(fullColor()).alpha(0) },
                        { offset: 0.2, color: fullColor() },
                        { offset: 0.8, color: fullColor() },
                        { offset: 1, color: new Color(fullColor()).alpha(0) }
                    ]
                })}
            />
            <Txt
                fill={fullColor()}
                fontFamily={"Poppins"}
                shadowBlur={20}
                shadowColor={`rgb(${new Color(fullColor()).rgb().map(i=>255-i).join(',')})`}
                ref={this.infoRef}
            />
        </Node>);
    }

    public *showInfo(info: string, duration: number = 3, t: number = 0.7) {
        this.hideInfo(0);
        yield* all(
            this.infoRef().y(-this.size().y * 0.75, t),
            this.infoRef().scale(1, t),
            this.infoRef().opacity(1, t),
            this.infoRef().text(info, t * 1.25),
        );
        yield* delay(duration, this.hideInfo(t));
    }

    public *toggle(on : boolean = true, color? : PossibleColor | (()=>Color)){
        
        if (!color){
            const colorcomp = ()=> 255 - this.darkmode()*255;
            color = ()=>new Color(`rgb(${colorcomp()},${colorcomp()},${colorcomp()})`);
        }

        if (!this.toggleCircle()){
            this.parent().add(<Circle
                zIndex={-1}
                position={this.position}
                scale={()=>this.scale().mul(this.toggleCircle().opacity() / 4.2 + .9)}
                opacity={0}
                size={this.size}
                fill={color}
                shadowBlur={50}
                shadowColor={color}
                ref={this.toggleCircle}
            />);
        }

        if (on){
            yield* all(
                this.toggleCircle().opacity(1, 1),
            )
        }else{
            yield* all(
                this.toggleCircle().opacity(0, 1),
            )
        }
    }

    public *pop(open: boolean = true, t: number = 0.3) {
        if (t == 0 && !open){
            this.scale(0);
            return;
        } 
        if (open) {
            yield* all(
                this.scale(1, t, easeOutCubic),
            );
        } else {
            yield* all(
                this.scale(0, t, easeOutCubic)
            );
        }
    }

    private *hideInfo(t: number) {
        yield* all(
            this.infoRef().y(-this.size().y * 0.25, t),
            this.infoRef().scale(0.3, t),
            this.infoRef().opacity(0, t),
        );
        this.infoRef().text("");
    }
}