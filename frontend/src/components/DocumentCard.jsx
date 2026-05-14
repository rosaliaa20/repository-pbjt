import { Link } from 'react-router-dom';

const DocumentCard = ({ id, title, category, author, year, views }) => {
    return (
        <Link to={`/document/${id}`} className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 hover:shadow-lg hover:border-blue-300 transition duration-300 flex flex-col h-full group">
            <div className="flex justify-between items-start mb-3">
                <span className="bg-blue-50 text-blue-700 text-xs font-bold px-2.5 py-1 rounded-md uppercase">
                    {category}
                </span>
                <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    {year}
                </span>
            </div>
            
            <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-2 group-hover:text-blue-700 transition">
                {title}
            </h3>
            
            <p className="text-sm text-gray-600 mb-4 flex-grow">
                Oleh: <span className="font-medium">{author}</span>
            </p>
            
            <div className="pt-3 border-t border-gray-100 flex justify-between items-center text-xs text-gray-500">
                <span>👁️ {views} kali dibaca</span>
                <span className="text-blue-600 font-bold group-hover:translate-x-1 transition transform">
                    Lihat Detail &rarr;
                </span>
            </div>
        </Link>
    );
};

export default DocumentCard;