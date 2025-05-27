export type Measure = {
    value: number,
    unit: string,
};

export interface Product {
    id: number,
    productName: string, // <-- CHANGE THIS: from product_name to productName
    brand: string,
    images?: string[],
    barcode?: string | null,

    itemWeight?: Measure | null,
    ingredients: string[],
    description?: string | null,
    storage: string[],
    itemsPerPack?: number | null, 
    color?: string | null,
    material?: string | null,
    width?: Measure | null,
    height?: Measure | null,
    warranty?: number | null
}

//Define a type for creating a new product (omits 'id')

export type ProductCreate = Omit<Product, 'id'>;