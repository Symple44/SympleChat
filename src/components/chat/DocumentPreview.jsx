const DocumentPreview = ({ document, onClick }) => (
  <div 
    className="border rounded-lg p-2 bg-white shadow-sm hover:shadow-md cursor-pointer mb-2"
    onClick={onClick}
  >
    <div className="flex items-center space-x-2">
      <div className="flex-shrink-0">
        <DocumentIcon className="h-5 w-5 text-blue-500" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">
          {document.source}
        </p>
        <p className="text-xs text-gray-500">
          Page {document.page_num}
        </p>
      </div>
    </div>
  </div>
);
