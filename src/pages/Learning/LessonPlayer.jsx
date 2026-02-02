import React from "react";
import { useParams } from "react-router-dom";

const LessonPlayer = () => {
  const { courseId, lessonId } = useParams();

  return (
    <div className="max-w-5xl mx-auto px-6 py-24">
      <h1 className="text-2xl font-black mb-4">
        Course {courseId} – Lesson {lessonId}
      </h1>

      <div className="aspect-video bg-black rounded-2xl mb-6" />

      <p className="text-slate-600">
        Lesson content goes here. Video, text, quizzes later.
      </p>
    </div>
  );
};

export default LessonPlayer;
