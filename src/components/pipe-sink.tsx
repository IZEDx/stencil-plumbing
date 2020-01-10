import { Component, Prop, State, Watch, Method } from '@stencil/core';
import { Pluck, Outlet, Pipe } from "plumbing-toolkit";
import { SinkMode } from '../types';

@Component({
  tag: 'pipe-sink'
})
export class PipeSink {

    @Prop() pipe?: Pipe<any>;
    @Prop() connect?: (outlet: Outlet<any>, pipe?: Pipe<any>) => Pluck;
    @Prop() mode: SinkMode = "replace";
    @Prop() clearOnUpdate = false;

    @State() values: any[] = [];

    _pluck = undefined;

    connectedCallback()
    {
        this.connectPipe();        
    }

    disconnectedCallback()
    {
        this.pluck();
    }

    @Watch("pipe")
    @Watch("connect")
    onPipeUpdate()
    {
        this.connectPipe();
    }

    connectPipe = () =>
    {
        this.pluck();
        const outlet = Outlet.to(this.updateOutput);

        if (this.connect)
        {
            this._pluck = this.connect(outlet, this.pipe)
        } 
        else if (this.pipe)
        {
            this._pluck = this.pipe.flush(outlet);
        }
    }

    updateOutput = (value: any) =>
    {
        switch (this.mode)
        {
            case "replace": 
                this.values = [value];
                break;
            case "append":
                this.values = [...this.values, value];
                break;
            case "prepend":
                this.values = [value, ...this.values];
                break;
        }
    }

    @Method()
    async pluck()
    {
        if (this._pluck) this._pluck();
        if (this.clearOnUpdate) this.values = [];
    }

    render() {
        return this.values;
    }
}
