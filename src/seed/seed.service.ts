import { Injectable } from '@nestjs/common';
import { ProductsService } from 'src/products/products.service';
import { initialData } from './data/seed-data';

@Injectable()
export class SeedService {
  constructor(
    private readonly productsService: ProductsService
  ){}

  async runSeed() {
    await this.insertNewProducts();
    return 'This action adds a new seed';
  }

  async insertNewProducts(){
    await this.productsService.deleteAllProducts();

    const promiseProducts = [];
    const products = initialData.products;
    products.forEach( product => {
      promiseProducts.push( this.productsService.create( product ) );
    });

    // Esperar hasta que resuelva todas las promesas.
    await Promise.all( promiseProducts );

    return true;
  }
}