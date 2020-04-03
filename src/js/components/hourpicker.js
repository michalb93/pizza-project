import { select, settings } from '../settings.js';
import { utils } from '../utils.js';
import { BaseWidget } from './basewidget.js';

export class HourPicker extends BaseWidget{
  constructor(wrapper){
	super(wrapper, settings.hours.open);
    const thisWidget = this;
    thisWidget.dom.input = thisWidget.dom.wrapper.querySelector(select.hourPicker.input);
    thisWidget.dom.output = thisWidget.dom.wrapper.querySelector(select.hourPicker.output);
	thisWidget.initPlugin();
    }
  
  initPlugin() {
    const thisWidget = this;
    thisWidget.dom.input.addEventListener('input', function(){
      thisWidget.value = thisWidget.dom.input.value;
    });
  }
  parseValue(value) {
    return utils.numberToHour(value);
  }
  isValid() {
    return true;
  }
  renderValue() {
    const thisWidget = this;
    thisWidget.dom.output.innerHTML = thisWidget.value;
  }
}