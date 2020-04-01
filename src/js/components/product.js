
import {select,classNames,templates} from '../settings.js';
import {utils} from '../utils.js';
import {AmountWidget} from './amountwidget.js';

export class Product {
  constructor(id,data){
    const thisProduct = this;
    thisProduct.id = id;
    thisProduct.data = data;
    thisProduct.renderInMenu();
    thisProduct.getElements();
    thisProduct.initAccordion();
    thisProduct.initOrderForm();
    thisProduct.initAmountWidget();
    thisProduct.processOrder();
    //console.log('new Product:', thisProduct);
  }
    
  getElements(){
    const thisProduct = this;

    thisProduct.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
    //console.log('thisProduct.accordionTrigger',thisProduct.accordionTrigger)
    thisProduct.form = thisProduct.element.querySelector(select.menuProduct.form);
    //console.log('thisProduct.form',thisProduct.form)
    thisProduct.formInputs = thisProduct.form.querySelectorAll(select.all.formInputs);
    //console.log('thisProduct.formInputs',thisProduct.formInputs)
    thisProduct.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);
    //console.log('thisProduct.cartButton',thisProduct.cartButton)
    thisProduct.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);
    //console.log('thisProduct.priceElem',thisProduct.priceElem)    
    thisProduct.imageWrapper = thisProduct.element.querySelector(select.menuProduct.imageWrapper);
    thisProduct.amountWidgetElem = thisProduct.element.querySelector(select.menuProduct.amountWidget);
  }
    
  renderInMenu(){
    const thisProduct = this;
    /*generate HTML based on template */
    const generatedHTML = templates.menuProduct(thisProduct.data);
    // const generatedHTML = templates.cartProduct(thisCart.products);
    //console.log('generatedHTML:', generatedHTML);
    /* create element using utils.createElementFromHTML */
    thisProduct.element = utils.createDOMFromHTML(generatedHTML);
    //thisCart.element = utils.createDOMFromHTML(generatedHTML);
    /*find menu container*/
    const menuContainer = document.querySelector(select.containerOf.menu);
    //const cartContainer = document.querySelector(select.containerOf.cart)
    /* add element to menu*/
    menuContainer.appendChild(thisProduct.element);
    //cartContainer.appendChild(thisCart.element);
  }
    
  initAccordion(){
    const thisProduct = this;
    /* find the clickable trigger (the element that should react to clicking) */
    const clickedElement = thisProduct.accordionTrigger; 
    /* START: click event listener to trigger */
    clickedElement.addEventListener('click', function(event){
      //console.log('clicked:', clickedElement);
      /* prevent default action for event */
      event.preventDefault();
      /* toggle active class on element of thisProduct */
      thisProduct.element.classList.toggle(classNames.menuProduct.wrapperActive);
      /* find all active products */
      //console.log('problem', thisProduct);
      const activeProducts = document.querySelectorAll(select.all.menuProductsActive);
      //console.log('found active products:', activeProducts);
      /* START LOOP: for each active product */
      for(let activeProduct of activeProducts){
        /* START: if the active product isn't the element of thisProduct */
        if(activeProduct !== thisProduct.element){
          /* remove class active for the active product */
          activeProduct.classList.remove(classNames.menuProduct.wrapperActive);         
        }   
      }    
    });
  }

  initOrderForm(){
    const thisProduct = this;

    //console.log('initOrderForm',thisProduct);
    thisProduct.form.addEventListener('submit', function(event){
      event.preventDefault();
      thisProduct.processOrder();
    });

    for(let input of thisProduct.formInputs){
      input.addEventListener('change', function(){
        thisProduct.processOrder();
      });
    }

    thisProduct.cartButton.addEventListener('click', function(event){
      event.preventDefault();
      thisProduct.processOrder();
      thisProduct.addToCart();
    });
  }

  initAmountWidget(){
    const thisProduct = this;

    thisProduct.amountWidget = new AmountWidget(thisProduct.amountWidgetElem);
    thisProduct.amountWidgetElem.addEventListener('updated', function(){
      thisProduct.processOrder();
    });
  }

  addToCart(){
    const thisProduct = this;
    thisProduct.name = thisProduct.data.name;
    thisProduct.amount = thisProduct.amountWidget.value;
    const event = new CustomEvent('add-to-cart', {
      bubbles: true,
      detail:{
        product:thisProduct,
      },
    });
    thisProduct.element.dispatchEvent(event);
  }

    
  processOrder(){
    const thisProduct = this;
    //console.log('ProcessOrder',thisProduct);
    /* read all data from the form (using utils.serializeFormToObject) and save it to const formData */
    const formData = utils.serializeFormToObject(thisProduct.form);
    //console.log('formData', formData);
    /* set variable price to equal thisProduct.data.price */
    thisProduct.params = {};
    let price = thisProduct.data.price;
    //const allParams = thisProduct.data.params;
    /* START LOOP: for each paramId in thisProduct.data.params */
    for(let paramId in thisProduct.data.params){
      /* save the element in thisProduct.data.params with key paramId as const param */
      const param = thisProduct.data.params[paramId];
      //console.log('param', param);
      /* START LOOP: for each optionId in param.options */
      for(let optionId in param.options){
        /* save the element in param.options with key optionId as const option */
        const option = param.options[optionId];
        const optionSelected = formData.hasOwnProperty(paramId) && formData[paramId].indexOf(optionId) > -1;
        /* START IF: if option is selected and option is not default */
        if(optionSelected && !option.default){
          /* add price of option to variable price */
          price = price + option.price;
          //console.log('new price:', option.price);
          /* END IF: if option is selected and option is not default */
        }
        /* START ELSE IF: if option is not selected and option is default */
        else if(!optionSelected && option.default){
          /* deduct price of option from price */
          price = price - option.price;
          //console.log('reduced price ', option.price);
          /* END ELSE IF: if option is not selected and option is default */
        }
        const allImages = thisProduct.imageWrapper.querySelectorAll('.' + paramId + '-' + optionId);
        //console.log('images', allImages);
        if(optionSelected){
          if(!thisProduct.params[paramId]){
            thisProduct.params[paramId] = {
              label: param.label,
              options: {},
            };
          }
          thisProduct.params[paramId].options[optionId] = option.label;

          for(let image of allImages){
            image.classList.add(classNames.menuProduct.imageVisible);
          }
        } else{
          for(let image of allImages){
            image.classList.remove(classNames.menuProduct.imageVisible);
          }
        }
      }        
    }    
    /* multiply price by amount */
    //newPrice = thisProduct.amountWidget.value * price;
    thisProduct.priceSingle = price;
    thisProduct.price = thisProduct.priceSingle * thisProduct.amountWidget.value;
    /* set the contents of thisProduct.priceElem to be the value of variable price */
    thisProduct.priceElem.innerHTML = thisProduct.price;
    //console.log('final price', price);
    //console.log('thisProduct.params:', thisProduct.params);
  }
}
