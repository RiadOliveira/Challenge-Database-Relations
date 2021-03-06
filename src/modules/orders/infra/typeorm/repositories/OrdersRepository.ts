import { getRepository, Repository } from 'typeorm';

import IOrdersRepository from '@modules/orders/repositories/IOrdersRepository';
import ICreateOrderDTO from '@modules/orders/dtos/ICreateOrderDTO';
import Order from '../entities/Order';

class OrdersRepository implements IOrdersRepository {
  private ormRepository: Repository<Order>;

  constructor() {
    this.ormRepository = getRepository(Order);
  }

  public async create({ customer, products }: ICreateOrderDTO): Promise<Order> {
    const createdProducts = products.map(product => {
      return {
        product_id: product.id,
        price: product.price,
        quantity: product.quantity,
      };
    });

    const newOrder = this.ormRepository.create({
      customer: {
        name: customer.name,
        email: customer.email,
        id: customer.id,
      },
      order_products: createdProducts,
    });

    await this.ormRepository.save(newOrder);

    return newOrder;
  }

  public async findById(id: string): Promise<Order | undefined> {
    const findedOrder = await this.ormRepository.findOne(id, {
      relations: ['order_products', 'customer'],
    });

    return findedOrder;
  }
}

export default OrdersRepository;
