import React from 'react';

import {render, screen} from '@testing-library/react';
import events from '@testing-library/user-event';
import {ExampleStore} from "../../src/server/data";
import {Form} from "../../src/client/components/Form";
import {Application} from "../../src/client/Application";
import {BrowserRouter, MemoryRouter} from "react-router-dom";
import {Provider} from "react-redux";
import {addToCart, checkout, clearCart, initStore} from "../../src/client/store";
import {CartApi, ExampleApi} from "../../src/client/api";
import {ProductDetails} from "../../src/client/components/ProductDetails";

describe('Проверка класса ExampleStore', () => {  // BUG_ID = 1
    it('Функция getAllProducts', () => {
        const store = new ExampleStore();

        const products = store.getAllProducts(+process.env.BUG_ID || 0);

        expect(products.map(product => product.name)).not.toContain(undefined);
    });
});

describe('Тестируем Application', () => {

});

describe('Тестируем компоненту Form', () => {
    it('Проверка обработки корректности введенных данных', async () => {  // BUG_ID = 10
        let submited = false;

        const app = <Form onSubmit={() => submited = true}/>;
        const {container} = render(app);

        await events.type(container.querySelector('#f-name'), 'Some name');
        await events.type(container.querySelector('#f-phone'), '+78005553535');
        await events.type(container.querySelector('#f-address'), 'Some address');

        await events.click(container.querySelector('button'));

        expect(submited).toBe(true);
    });
});

describe('Тестируем компоненту Application', () => {
    it('Корректность работы коллапсера', async () => {  // BUG_ID = 4
        const api = new ExampleApi('/hw/store');
        const cart = new CartApi();
        const store = initStore(api, cart);
        const app = (
            <BrowserRouter>
                <Provider store={store}>
                    <Application/>
                </Provider>
            </BrowserRouter>
        );
        const {container} = render(app);

        await events.click(container.querySelector('.nav-link'));

        expect(container.querySelector('.navbar-collapse').classList.contains('collapse')).toBe(true);
    });
});

describe('Тестируем компоненту ProductDetails', () => {
    it('Размер кнопки', async () => {  // BUG_ID = 9
        const product = (new ExampleStore()).getProductById(0);
        const api = new ExampleApi('/hw/store');
        const cart = new CartApi();
        const store = initStore(api, cart);
        const app = (
            <BrowserRouter>
                <Provider store={store}>
                    <ProductDetails product={product}/>;
                </Provider>
            </BrowserRouter>
        )
        const {container} = render(app);

        screen.logTestingPlaygroundURL();

        expect(container.querySelector('.ProductDetails-AddToCart').classList.contains('btn-lg')).toBe(true);
    });
});

describe('Тестируем store', () => {
    it('редьюсер', () => {  // BUG_ID = 7
        const api = new ExampleApi('/hw/store');
        const cart = new CartApi();
        const store = initStore(api, cart);

        const countBefore = store.getState().cart[1]?.count || 0;
        const product = (new ExampleStore()).getProductById(1);
        store.dispatch(addToCart(product));
        const countAfter = store.getState().cart[1]?.count || 0;

        expect(countAfter).toEqual(countBefore + 1);
    });

    it('добавление и чистка корзины', () => {  // BUG_ID = 6
        const api = new ExampleApi('/hw/store');
        const cart = new CartApi();
        const store = initStore(api, cart);

        const product1 = (new ExampleStore()).getProductById(1);
        store.dispatch(addToCart(product1));

        const product2 = (new ExampleStore()).getProductById(2);
        store.dispatch(addToCart(product2));

        const countBefore = Object.values(cart.getState()).length;
        store.dispatch(clearCart());
        const countAfter = Object.values(cart.getState()).length;

        expect(countBefore).toEqual(2);
        expect(countAfter).toEqual(0);
    });

    it('чекаут', () => { // NOT FOUND BUG (BUG_ID = 5)
        const api = new ExampleApi('/hw/store');
        const cart = new CartApi();
        const store = initStore(api, cart);

        const product1 = (new ExampleStore()).getProductById(1);
        store.dispatch(addToCart(product1));

        const product2 = (new ExampleStore()).getProductById(2);
        store.dispatch(addToCart(product2));

        const countBefore = Object.values(cart.getState()).length;

        store.dispatch(checkout({
            name: 'name',
            phone: '+78005553535',
            address: 'address',
        }, cart.getState()));
        const countAfter = Object.values(cart.getState()).length;

        expect(countBefore).toEqual(2);
        expect(countAfter).toEqual(0);
    });
});

// 1, 10, 7, 4, 9, 6