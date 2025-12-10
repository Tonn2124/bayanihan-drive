export default function FileUploader({ onUpload, maxFiles=1, accept='image/*' }) { return <input type='file' accept={accept} onChange={(e) => onUpload(e.target.files)} multiple={maxFiles > 1} /> }
