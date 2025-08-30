// create a singleton function controller using zustand
import { create } from 'zustand';

const ImagePickerController = create((set) => ({
    showImagePicker: false,
    imageData: null,
    setImageData: (image) => set({ imageData: image }),
    setShowImagePicker: (show) => set({ showImagePicker: show }),
}));

export default ImagePickerController;