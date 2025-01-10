# TAPI-graphql


## Porduct list 

```
query AllprodcutsWithsupp{
  products {
    id
    name
    nutritional_values {
      carbohydrates
      proteins
      fats
    }
    supplier {
      id_supplier
      name
      rating
      contact_info {
        address
        phone
      }
    }
    category {
      id_category
      name
      description
    }
  }
}
```

## Category list 

```
query AllCategories{
  categories {
    id_category
    name
    description
  }
}
```

## Supplier list

```
query AllSuppilers{
suppliers {
  id_supplier
  name
  rating
  contact_info {
    address
    phone
  }
}
}
```

## Product ID 

```
query GetProduct($id: ID!) {
  product(id: $id) {
    id
    name
    nutritional_values {
      carbohydrates
      proteins
      fats
    }
    id_supplier {
      id_supplier
      name
      contact_info {
        address
        phone
      }
    }
    category_id {
      id_category
      name
      main_category
      description
    }
  }
}

json : 
{
    "id" : 1
}

```

## Sorted Products 

```
query GetSortedProducts($sortBy: String, $sortOrder: String) {
  products(sortBy: $sortBy, sortOrder: $sortOrder) {
    id
    name
    nutritional_values {
      carbohydrates
      proteins
      fats
    }
    category {
      id_category
      name
    }
    supplier {
      id_supplier
      name
    }
  }
}


{
  "sortBy": "name",
  "sortOrder": "asc"
}
```


# Mutation 

## Add product

```
mutation addNewProduct($input: ProductInput!){
  addProduct(input: $input){
    id
    name
    category {
      id_category
    }
    supplier {
      id_supplier
    }
    nutritional_values {
      carbohydrates
      proteins
      fats
    }
  }
}

{
  "input": {
    "name": "Energy drink",
    "category_id": 105 ,
    "supplier_id": "1",
    "nutritional_values": {
      "carbohydrates": 9.9 ,
      "proteins": 2,
      "fats": 0
    }

  }
}
```


## delete product 

```
mutation DeleteProduct($id: ID!) {
  deleteProduct(id: $id) {
    id
    name
    category_id
    id_supplier
  }
}

{
  "id": 1
}
```

## update Product

```
mutation UpdateProduct($id: ID!, $input: UpdateProductInput!) {
  updateProduct(id: $id, input: $input) {
    id
    name
    category_id
    id_supplier
    nutritional_values {
      carbohydrates
      proteins
      fats
    }
  }
}

{
    "id": 1, 
    "input" : {
        "name" : "new name"
    }
}
```

# Filters

## min, max values 

```
query GetFilteredProducts($filter: ProductFilter) {
  products(filter: $filter) {
    id
    name
    category_id
    supplier {
      id_supplier
      name
      rating
    }
    nutritional_values {
      carbohydrates
      proteins
      fats
    }
  }
}


{
  "filter": {
    "category_id": 101,
    "min_carbohydrates": 5,
    "max_carbohydrates": 10,
    "min_rating": 2.5
  }
}
```

## offset , sort oder , sort by

```
query GetSuppliers(
  $filter: SupplierFilter
  $limit: Int
  $offset: Int
  $sortBy: String
  $sortOrder: String
) {
  suppliers(
    filter: $filter
    limit: $limit
    offset: $offset
    sortBy: $sortBy
    sortOrder: $sortOrder
  ) {
    id_supplier
    name
    rating
    contact_info {
      address
      phone
    }
  }
}


{
  "filter": {
    "min_rating": 3.0,
    "max_rating": 5.0,
    
  },
  "limit": 10,
  "offset": 0,
  "sortBy": "rating",
  "sortOrder": "asc"
}
```






