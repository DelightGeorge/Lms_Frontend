import React from "react";
import { Star } from "lucide-react";

const CourseCard = ({ title, instructor, rating, reviews, price, image }) => {
  return (
    <div className="group cursor-pointer bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all">
      <div className="aspect-[16/10] overflow-hidden relative">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur px-2 py-1 rounded text-[10px] font-bold uppercase shadow-sm">
          Bestseller
        </div>
      </div>

      <div className="p-4">
        <h3 className="font-bold text-slate-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
          {title}
        </h3>
        <p className="text-sm text-slate-500 mb-2">{instructor}</p>

        <div className="flex items-center gap-2 mb-2">
          <span className="text-orange-600 font-bold">{rating}</span>
          <div className="flex text-orange-400">
            <Star size={14} fill="currentColor" />
          </div>
          <span className="text-slate-400 text-xs">({reviews} reviews)</span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xl font-bold text-slate-900">${price}</span>
          <span className="text-slate-400 line-through text-sm">$84.99</span>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;
