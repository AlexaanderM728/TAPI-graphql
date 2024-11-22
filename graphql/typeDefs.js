import { gql } from 'graphql-tag';

const typeDefs = gql`
  # Typ reprezentujący produkt
  type Product {
    id: ID!
    name: String!
    category_id: Category!
    id_supplier: Supplier!
    nutritional_values: NutritionalValues!
  }

  # Typ reprezentujący wartości odżywcze
  type NutritionalValues {
    carbohydrates: Float!
    proteins: Float!
    fats: Float!
  }

  # Typ reprezentujący kategorię
  type Category {
    id_category: ID!
    name: String!
    main_category: String
    description: String
  }

  # Typ reprezentujący dostawcę
  type Supplier {
    id_supplier: ID!
    name: String!
    contact_info: ContactInfo!
    rating: Float
  }

  # Typ reprezentujący dane kontaktowe dostawcy
  type ContactInfo {
    address: String!
    phone: String!
  }

  # Typy zapytań
  type Query {
    products: [Product!]!
    product(id: ID!): Product
    categories: [Category!]!
    category(id_category: ID!): Category
    suppliers: [Supplier!]!
    supplier(id_supplier: ID!): Supplier
  }
`;

export default typeDefs;