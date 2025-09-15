'use client';

import { shopCache, shopDataSource } from "@/data/shop";
import { Shop } from "@/utils/shops";
import { Crud, useSession } from "@toolpad/core";
import { unauthorized, useParams } from "next/navigation";

export default function ShopPage() {
  const params = useParams();
  const session = useSession();
  if (!session) {
    return unauthorized();
  }
  const [shopId] = params.segments ?? [];

  return (
    <Crud<Shop>
      dataSource={shopDataSource}
      dataSourceCache={shopCache}
      rootPath={`/admin/shop`}
      pageTitles={{
        show: `Shop ${shopId}`,
        create: 'Create Shop',
        edit: `Edit Shop ${shopId}`,
      }}
    />
    )
}