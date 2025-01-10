import { Injectable, Logger, NotFoundException, OnModuleInit, Query } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaClient } from '@prisma/client';
import { PaginatonDto } from 'src/common';
import { last } from 'rxjs';

@Injectable()
export class ProductsService extends PrismaClient implements OnModuleInit {

  private readonly logger = new Logger('ProductsService');

  onModuleInit() {
    this.$connect();
    this.logger.log('Database connected');
  }
  create(createProductDto: CreateProductDto) {
    return this.product.create({
      data: createProductDto
    });
  }

  async findAll(paginatonDto: PaginatonDto) {
    const {
      page,
      limit,
    } = paginatonDto;

    const totalPage = await this.product.count();

    const lastPage = Math.ceil(totalPage / limit);

    return {
      data: await this.product.findMany({
        take: limit,
        skip: (page - 1) * limit,
        where: { available: true }
      }),
      meta:{
        totalPage: totalPage,
        page: page,
        lastPage: lastPage
      }
    }
  }

  async findOne(id: number) {
    const product = await this.product.findFirst({ where: { id, available:true } });
    if (!product) {
      throw new NotFoundException(`Product #${id} not found`);
    }
    return product;
  }

  async update(id: number, updateProductDto: UpdateProductDto) {

    const { id:__, ...data } = updateProductDto;
    
    await this.findOne(id);

    return this.product.update({
      where: { id },
      data: updateProductDto
    }); 
  }

  async remove(id: number) {
    await this.findOne(id);
    const product = await this.product.update({
      where: { id },
      data: { available: false }
    });
    return product;
    
    // return await this.product.delete({
    //   where: { id }
    // });
  }
}
