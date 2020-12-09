import { getRepository, Repository } from 'typeorm';

import IProductsRepository from '@modules/products/repositories/IProductsRepository';
import ICreateProductDTO from '@modules/products/dtos/ICreateProductDTO';
import IUpdateProductsQuantityDTO from '@modules/products/dtos/IUpdateProductsQuantityDTO';
import Product from '../entities/Product';

interface IFindProducts {
  id: string;
}

class ProductsRepository implements IProductsRepository {
  private ormRepository: Repository<Product>;

  constructor() {
    this.ormRepository = getRepository(Product);
  }

  public async create({
    name,
    price,
    quantity,
  }: ICreateProductDTO): Promise<Product> {
    const newProduct = this.ormRepository.create({ name, price, quantity });

    await this.ormRepository.save(newProduct);

    return newProduct;
  }

  public async findByName(name: string): Promise<Product | undefined> {
    const findedProduct = await this.ormRepository.findOne({
      where: { name },
    });

    return findedProduct;
  }

  public async findAllById(
    products: IFindProducts[],
  ): Promise<Product[] | undefined> {
    if (products.length === 0) {
      return undefined;
    }

    const getProductsPromises = products.map(async product => {
      const findedProduct = await this.ormRepository.findOne(product.id);

      return findedProduct;
    });

    const allProducts = (await Promise.all(getProductsPromises)) as Product[];

    const validate = {
      value: true,
    };

    allProducts.forEach(product => {
      if (product === undefined) {
        validate.value = false;
      }
    });

    if (!validate.value) {
      return undefined;
    }

    return allProducts;
  }

  public async updateQuantity(
    products: IUpdateProductsQuantityDTO[],
    findedProducts: Product[],
  ): Promise<Product[] | undefined> {
    const updatedProducts = findedProducts.map((product, index) => {
      const updatedProduct = product;

      updatedProduct.quantity -= products[index].quantity;

      return updatedProduct;
    });

    if (updatedProducts.find(product => product.quantity < 0)) {
      return undefined;
    }

    await this.ormRepository.save(updatedProducts);

    return updatedProducts;
  }
}

export default ProductsRepository;
