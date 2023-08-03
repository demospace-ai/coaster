import { useState } from "react";
import { useParams } from "react-router-dom";
import { Loading } from "src/components/loading/Loading";
import { useListing } from "src/rpc/data";

export const Listing: React.FC = () => {
  const { listingID } = useParams<{ listingID: string }>();
  const { listing, error } = useListing(Number(listingID));
  const [file, setFile] = useState<File | null>(null);

  if (!listing) {
    if (!error) {
      return <Loading />;
    } else {
      return <div>Something unexpected happened.</div>;
    }
  }

  return <div>{listing.name}</div>;
};

/*
How to upload file

const [file, setFile] = useState<File | null>(null);

<input
  type="file"
  onChange={(event: FormEvent<HTMLInputElement>) => {
    if (event.currentTarget && event.currentTarget.files) setFile(event.currentTarget.files[0]);
  }}
/>
<button
  onClick={() => {
    if (file) {
      const formData = new FormData();
      formData.append("listing_image", file);
      fetch(`http://localhost:8080/listings/${listingID}/image`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });
    }
  }}
>
  Upload
</button>

*/
