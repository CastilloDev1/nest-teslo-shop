import { BadRequestException, Injectable, InternalServerErrorException, 
  Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { validate as isUUID } from 'uuid';

import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

import { DataSource, Repository } from 'typeorm';

import { PaginationDto } from 'src/common/dto/pagination.dto';
import { Product, ProductImage } from './entities';

@Injectable()
export class ProductsService {

  private readonly logger = new Logger('ProductsService');

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(ProductImage)
    private readonly productImageRepository: Repository<ProductImage>,
    private readonly dataSource: DataSource
  ){}

  async create({ images = [], ...productDetails }: CreateProductDto) {
    try {
      const product = this.productRepository.create({
        ...productDetails,
        images: images.map( url => this.productImageRepository.create({ url }) )
      });
      await this.productRepository.save(product);
      return { ...product, images };
    } catch (error) {
      this.handlerDBException(error);
    }
  }

  async findAll({ limit = 10, offset = 0}: PaginationDto) {
    try {
      const products: Product[] = await this.productRepository.find({
        take: limit,
        skip: offset,
        relations: {
          images: true
        }
      });

      return products.map( ({ images, ...restProduct }) => ({
        ...restProduct,
        images: images.map( (image) => image.url )
      }));
    } catch (error) {
      
    }
  }

  async findOne(term: string) {

    let product: Product;
    if( isUUID(term) ) {
      product = await this.productRepository.findOneBy({ 'id': term});
    }else{
      const queryBuilder = this.productRepository.createQueryBuilder("prod");
      product = await queryBuilder
        .where('title =:title or slug =:slug', {
          title: term,
          slug: term
        })
        .leftJoinAndSelect('prod.images', 'prodImages')
        .getOne()
    }

    if (!product) throw new NotFoundException(`Product with term ${term} not found`);

    return product;
  }

  async findOnePlain( term: string) {
    const { images = [], ...restProduct } = await this.findOne( term );
    return {
      ...restProduct,
      images: images.map( image => image.url )
    }
  }

  async update(id: string, { images, ...updateProductDto}: UpdateProductDto) {
    const product: Product = await this.productRepository.preload({
      id,
      ...updateProductDto
    });

    if( !product ) throw new NotFoundException(`Product with id ${id} not found.`);
    
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      if( images ) {
        await queryRunner.manager.delete( ProductImage, { product: { id } });
        product.images = images.map (
          image => this.productImageRepository.create({ url: image })
        );
      }
      await queryRunner.manager.save(product);
      await queryRunner.commitTransaction();

      return this.findOnePlain( id );
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.handlerDBException(error);
    } finally {
      await queryRunner.release();
    }
  }

  async remove(id: string) {
    const product = await this.findOne(id);
    await this.productRepository.remove(product);
  }

  async deleteAllProducts() {
    const query = this.productRepository.createQueryBuilder('product');
    try {
      return await query
        .delete()
        .where({})
        .execute();
    } catch (error) {
      this.handlerDBException(error);
    }
  }

  private handlerDBException(error: any): void {
    if( error.code === '23505' ) throw new BadRequestException(error.detail);
    this.logger.error(error);
    throw new InternalServerErrorException(error.details);
  }
}
