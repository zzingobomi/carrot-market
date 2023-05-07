import type { NextPage } from "next";
import FloatingButton from "@components/floating-button";
import Item from "@components/item";
import Layout from "@components/layout";
import useUser from "@libs/client/useUser";
import { Product } from "@prisma/client";
import useSWR, { SWRConfig } from "swr";
import Image from "next/image";
import riceCake from "../public/local.jpeg";
import client from "@libs/server/client";

export interface ProductWithCount extends Product {
  _count: {
    favs: number;
  };
}

interface ProductsResponse {
  ok: boolean;
  products: ProductWithCount[];
}

const Home: NextPage = () => {
  const { user, isLoading } = useUser();
  const { data } = useSWR<ProductsResponse>("/api/products");

  return (
    <Layout title="홈" hasTabBar>
      <div className="flex flex-col space-y-5 divide-y">
        {data
          ? data?.products?.map((product) => (
              <Item
                key={product.id}
                id={product.id}
                title={product.name}
                price={product.price}
                hearts={product._count?.favs}
              ></Item>
            ))
          : "Loading..."}
      </div>
      <FloatingButton href="/products/upload">
        <svg
          className="h-6 w-6"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
          />
        </svg>
      </FloatingButton>
      {/* <Image src={riceCake} placeholder="blur" quality={5} alt="test" /> */}
    </Layout>
  );
};

// SSR 의 장점과 SWR 의 캐시 기능을 같이 사용하기 위해 서버사이드에서 SWR 캐시에 products 값을 넣어준다
// 이렇게 되면 서버에서 db 접속 한번, client 에서 db 접속 한번 하는것은 아닌가..?
const Page: NextPage<{ products: ProductWithCount[] }> = ({ products }) => {
  return (
    <SWRConfig
      value={{
        fallback: {
          "/api/products": {
            ok: true,
            products,
          },
        },
      }}
    >
      <Home />
    </SWRConfig>
  );
};

export async function getServerSideProps() {
  console.log("SSR");
  const products = await client.product.findMany({});

  return {
    props: {
      products: JSON.parse(JSON.stringify(products)),
    },
  };
}

export default Page;
