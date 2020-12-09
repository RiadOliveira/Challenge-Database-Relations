import { Request, Response } from 'express';

import { container } from 'tsyringe';

import CreateOrderService from '@modules/orders/services/CreateOrderService';
import FindOrderService from '@modules/orders/services/FindOrderService';

export default class OrdersController {
  public async show(request: Request, response: Response): Promise<Response> {
    const { id } = request.params;

    const findOrderService = container.resolve(FindOrderService);

    const order = await findOrderService.execute({ id });

    const orderProductsView = order.order_products.map(order_product => {
      return {
        price: order_product.price,
        product_id: order_product.product_id,
        quantity: order_product.quantity,
      };
    });

    const orderView = {
      customer: {
        email: order.customer.email,
        name: order.customer.name,
        id: order.customer.id,
      },
      order_products: orderProductsView,
    };

    return response.status(200).json(orderView);
  }

  public async create(request: Request, response: Response): Promise<Response> {
    const { customer_id, products } = request.body;

    const createOrder = container.resolve(CreateOrderService);

    const newOrder = await createOrder.execute({ customer_id, products });

    const orderView = {
      id: newOrder.id,
      customer: newOrder.customer,
      order_products: newOrder.order_products,
    };

    return response.status(200).json(orderView);
  }
}
