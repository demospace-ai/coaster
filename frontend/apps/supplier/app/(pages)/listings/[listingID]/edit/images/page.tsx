"use client";

import { Button } from "@coaster/components/button/Button";
import { Card } from "@coaster/components/dnd/DragAndDrop";
import { FormError } from "@coaster/components/error/FormError";
import { Loading } from "@coaster/components/loading/Loading";
import { Modal } from "@coaster/components/modal/Modal";
import { addListingImage, deleteListingImage, updateListingImages } from "@coaster/rpc/client";
import { Image as ImageType, Listing } from "@coaster/types";
import { forceErrorMessage } from "@coaster/utils/common";
import { PlusIcon, XMarkIcon } from "@heroicons/react/24/outline";
import update from "immutability-helper";
import Image from "next/image";
import { FormEvent, useCallback, useRef, useState } from "react";
import { DndProvider, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { useListingContext } from "supplier/app/(pages)/listings/[listingID]/edit/context";

export default function Images() {
  const listing = useListingContext();

  return (
    <DndProvider backend={HTML5Backend}>
      <ImagesInner listing={listing} />
    </DndProvider>
  );
}

const ImagesInner: React.FC<{ listing: Listing }> = ({ listing }) => {
  const [error, setError] = useState<string | undefined>(undefined);
  const [images, setImages] = useState(listing.images);
  const newImageRef = useRef<HTMLInputElement | null>(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [imageToDelete, setImageToDelete] = useState<number | null>(null);
  const [uploading, setUploading] = useState(false);

  const findCard = useCallback(
    (id: string) => {
      const found = images.filter((image) => `${image.id}` === id)[0];
      return {
        found,
        index: images.indexOf(found),
      };
    },
    [images],
  );

  const moveCard = useCallback(
    (id: string, atIndex: number) => {
      const { found, index } = findCard(id);
      setImages(
        update(images, {
          $splice: [
            [index, 1],
            [atIndex, 0, found],
          ],
        }),
      );
    },
    [findCard, images, setImages],
  );

  const updateImages = async () => {
    try {
      await updateListingImages(listing.id, images);
    } catch (e) {}
  };

  const addImage = async (e: FormEvent<HTMLInputElement>) => {
    setUploading(true);
    if (e.currentTarget && e.currentTarget.files) {
      for (const file of Array.from(e.currentTarget.files)) {
        if (file.size > 5 * 1024 * 1024) {
          setError("Image size must be less than 5MB.");
          continue;
        }

        const formData = new FormData();
        formData.append("listing_image", file);
        try {
          const listingImage = await addListingImage(listing, formData);
          setImages((prev) => [...prev, listingImage]);
          setError(undefined);
        } catch (e) {
          setError(forceErrorMessage(e));
        }
      }
    }
    setUploading(false);
  };

  const [, drop] = useDrop(() => ({ accept: "card" }));
  return (
    <div className="tw-flex tw-flex-col tw-w-full">
      <div className="tw-text-2xl tw-font-semibold">Images</div>
      <div
        ref={drop}
        className="tw-w-full tw-grid tw-grid-cols-1 sm:tw-grid-cols-2 tw-mt-3 tw-gap-4 sm:tw-gap-8 tw-justify-items-center"
      >
        {images.map((image) => (
          <Card
            key={image.id}
            id={String(image.id)}
            moveCard={moveCard}
            findCard={findCard}
            onDrop={updateImages}
            className="tw-relative tw-w-full tw-aspect-square"
          >
            <Image
              fill
              sizes="(max-width: 640px) 100vw, 1/2vw"
              alt="Listing image"
              className="tw-aspect-square tw-bg-gray-100 tw-object-cover hover:tw-brightness-90 tw-transition-all tw-duration-100 tw-rounded-lg tw-cursor-grab"
              src={image.url}
            />
            <XMarkIcon
              className="tw-w-8 tw-absolute tw-right-2 tw-top-2 tw-bg-gray-100 tw-p-1 tw-rounded-lg tw-opacity-80 tw-cursor-pointer hover:tw-opacity-100"
              onClick={() => {
                if (images.length <= 3) {
                  setError("You must have at least 3 images.");
                  return;
                }
                setImageToDelete(image.id);
                setShowDeleteConfirmation(true);
              }}
            />
          </Card>
        ))}
        <div
          className="tw-group tw-aspect-square tw-w-full tw-bg-gray-100 tw-rounded-lg tw-cursor-pointer tw-flex tw-justify-center tw-items-center"
          onClick={() => newImageRef.current?.click()}
        >
          <input ref={newImageRef} type="file" multiple className="tw-hidden tw-invisible" onChange={addImage} />
          {uploading ? (
            <Loading className="tw-h-12 tw-w-12 tw-mx-auto tw-my-auto" />
          ) : (
            <PlusIcon className="tw-h-12 tw-mx-auto tw-my-auto tw-text-gray-400 group-hover:tw-text-gray-600 tw-transition-all tw-duration-100" />
          )}
        </div>
        <DeleteModal
          listing={listing}
          imageID={imageToDelete}
          setImages={setImages}
          show={showDeleteConfirmation}
          closeModal={() => setShowDeleteConfirmation(false)}
        />
      </div>
      {error && <FormError message={error} className="tw-mt-2" />}
    </div>
  );
};

interface DeleteModalProps {
  listing: Listing;
  imageID: number | null;
  setImages: (images: ImageType[]) => void;
  show: boolean;
  closeModal: () => void;
}

const DeleteModal: React.FC<DeleteModalProps> = ({ listing, imageID, setImages, show, closeModal }) => {
  const [deleting, setDeleting] = useState(false);
  const deleteImage = async () => {
    if (imageID === null) return; // TODO: this should not happen
    setDeleting(true);
    try {
      const newImages = await deleteListingImage(listing, imageID);
      setImages(newImages);
      closeModal();
    } catch (e) {}
    setDeleting(false);
  };

  return (
    <Modal show={show} close={closeModal}>
      <div className="tw-flex tw-flex-col tw-items-center tw-w-[320px] sm:tw-w-[420px] tw-px-8 sm:tw-px-12 tw-pb-10">
        <div className="tw-text-center tw-w-full tw-text-xl tw-font-medium tw-mb-6">Permanently delete this image?</div>
        <Button
          className="tw-flex tw-h-10 tw-w-48 tw-items-center tw-justify-center tw-whitespace-nowrap"
          onClick={deleteImage}
        >
          {deleting ? <Loading light /> : "Delete"}
        </Button>
      </div>
    </Modal>
  );
};
