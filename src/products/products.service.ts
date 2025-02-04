import { BadRequestException, Injectable, InternalServerErrorException, 
  Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { validate as isUUID } from 'uuid';

import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';
import { Repository } from 'typeorm';

import { PaginationDto } from 'src/common/dto/pagination.dto';

@Injectable()
export class ProductsService {

  private readonly logger = new Logger('ProductsService');

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>
  ){}

  async create(createProductDto: CreateProductDto) {
    try {
      const product = this.productRepository.create(createProductDto);
      await this.productRepository.save(product);
      return product;
    } catch (error) {
      this.handlerDBException(error);
    }
  }

  async findAll({ limit = 10, offset = 0}: PaginationDto) {
    try {
      return await this.productRepository.find({
        take: limit,
        skip: offset
      })
    } catch (error) {
      
    }
  }

  async findOne(term: string) {

    let product: Product;
    if( isUUID(term) ) {
      product = await this.productRepository.findOneBy({ 'id': term});
    }else{
      const queryBuilder = this.productRepository.createQueryBuilder();
      product = await queryBuilder
        .where('title =:title or slug =:slug', {
          title: term,
          slug: term
        }).getOne()
    }

    if (!product) throw new NotFoundException(`Product with term ${term} not found`);

    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto) {

    const product: Product = await this.productRepository.preload({
      id,
      ...updateProductDto
    });

    if( !product ) throw new NotFoundException(`Product with id ${id} not found.`);
    
    try {
      await this.productRepository.save(product)
      return product;
    } catch (error) {
      this.handlerDBException(error);
    }
  }

  async remove(id: string) {
    const product = await this.findOne(id);
    await this.productRepository.remove(product);
  }

  private handlerDBException(error: any): void {
    if( error.code === '23505' ) throw new BadRequestException(error.detail);
    this.logger.error(error);
    throw new InternalServerErrorException(error.details);
  }
}
