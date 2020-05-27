import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';
import { Alert } from 'react-native';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Product): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const localProducts = await AsyncStorage.getItem(
        '@GoMarketplace:products',
      );

      if (localProducts) {
        setProducts([...JSON.parse(localProducts)]);
      }
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async product => {
      const checkProduct = products.find(
        findProduct => findProduct.id === product.id,
      );

      if (checkProduct) {
        setProducts(
          products.map(findProduct =>
            findProduct.id === product.id
              ? { ...product, quantity: findProduct.quantity + 1 }
              : findProduct,
          ),
        );
      } else {
        setProducts([...products, { ...product, quantity: 1 }]);
      }

      await AsyncStorage.setItem(
        '@GoMarketplace:products',
        JSON.stringify(products),
      );
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      const items = [...products];

      const productIndex = items.findIndex(product => product.id === id);
      if (productIndex !== -1) {
        items[productIndex].quantity += 1;

        setProducts(items);
      }

      await AsyncStorage.setItem(
        '@GoMarketPlace:product',
        JSON.stringify(items),
      );

      // const itemProd = products.find(product => product.id === id);
      // itemProd.quantity += 1;

      // try {
      //   await AsyncStorage.setItem(id.toString(), JSON.stringify(itemProd));
      //   const prod = await AsyncStorage.getItem(id.toString());
      //   setProducts(state => [...state]);
      // } catch (err) {
      //   console.log(err);
      // }
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      const items = [...products];

      const productIndex = items.findIndex(product => product.id === id);
      if (productIndex !== -1) {
        if (items[productIndex].quantity > 1) {
          items[productIndex].quantity -= 1;
        }

        setProducts(items);
      }

      await AsyncStorage.setItem(
        '@GoMarketPlace:product',
        JSON.stringify(items),
      );

      // const itemProd = products.find(product => product.id === id);
      // if (itemProd?.quantity === 1) {
      //   itemProd.quantity = 1;
      // } else {
      //   itemProd.quantity -= 1;
      // }

      // try {
      //   await AsyncStorage.setItem(id.toString(), JSON.stringify(itemProd));
      //   setProducts(state => [...state]);
      // } catch (err) {
      //   console.log(err);
      // }
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
