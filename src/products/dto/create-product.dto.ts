import { IsArray, IsIn, IsInt, IsNumber, IsOptional, IsPositive, IsString, MinLength } from "class-validator";

export class CreateProductDto {

    @IsString()
    @MinLength(1) //Debe ser mayor o igual a 1 character
    title: string;

    @IsNumber()
    @IsPositive()
    @IsOptional()
    price?: number;

    @IsString()
    @IsOptional()
    description?: string;

    @IsString()
    @IsOptional()
    slug?: string;

    @IsInt()      //Debe ser numerico con decimales
    @IsPositive()
    @IsOptional()
    stock?: number;

    @IsString({ each: true }) //Debe tener las mismas reglas para los elementos del array
    @IsArray()
    sizes: string[];

    @IsIn(['men','women','kid','unisex']) //Debe permitir solo los valores asignados en @IsIn(...)
    gender: string;

    @IsString({ each: true })
    @IsArray()
    @IsOptional()
    tags?: string[];

    @IsString({ each: true })
    @IsArray()
    @IsOptional()
    images?: string[]
}
