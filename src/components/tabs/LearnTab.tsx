import React, { useState } from 'react';
import { motion } from 'motion/react';
import { BookOpen, CheckCircle, Download, HardDrive, Play, Sparkles, Trash2, Video } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Course } from '../../types';

export const LearnTab: React.FC = () => {
  const { courses, toggleLessonCompletion, toggleCourseDownload, isOnline } = useApp();
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [filterDownloadedOnly, setFilterDownloadedOnly] = useState(false);

  const displayedCourses = filterDownloadedOnly ? courses.filter((c) => c.isDownloaded) : courses;

  return (
    <div className="min-h-full pb-20 text-white space-y-4 p-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-white/10">
        <div>
          <h2 className="text-lg font-extrabold tracking-tight text-white flex items-center gap-2">
            <span>Learn Academy</span>
            <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-[10px] font-bold tracking-wider">
              Offline Ready
            </span>
          </h2>
          <p className="text-xs text-slate-400">Download lessons and master React Native, Biometrics & Security.</p>
        </div>

        <button
          onClick={() => setFilterDownloadedOnly(!filterDownloadedOnly)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-xs font-bold border transition ${
            filterDownloadedOnly
              ? 'bg-indigo-500/20 border-indigo-400 text-indigo-300'
              : 'bg-slate-900/60 border-white/10 text-slate-400 hover:text-white'
          }`}
        >
          <HardDrive className="w-3.5 h-3.5 text-indigo-400" />
          <span>Downloaded ({courses.filter((c) => c.isDownloaded).length})</span>
        </button>
      </div>

      {selectedCourse ? (
        /* Lesson Reader View */
        <div className="space-y-4">
          <button
            onClick={() => setSelectedCourse(null)}
            className="text-xs text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1"
          >
            ← Back to All Courses
          </button>

          {/* Course Hero */}
          <div className="relative rounded-3xl overflow-hidden border border-white/10 bg-slate-900 shadow-xl">
            <img
              src={selectedCourse.thumbnail}
              alt={selectedCourse.title}
              referrerPolicy="no-referrer"
              className="w-full h-44 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent p-4 flex flex-col justify-end">
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-[9px] font-extrabold uppercase tracking-widest w-fit mb-1">
                {selectedCourse.category} • {selectedCourse.level}
              </span>
              <h3 className="text-lg font-bold text-white">{selectedCourse.title}</h3>
              <p className="text-xs text-slate-300 line-clamp-2 mt-1">{selectedCourse.description}</p>
            </div>
          </div>

          {/* Progress & Download Controls */}
          <div className="p-4 rounded-3xl bg-slate-900/60 border border-white/10 backdrop-blur-2xl flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs text-slate-400 block font-medium">Course Progress</span>
              <div className="flex items-center gap-2">
                <div className="w-32 h-2 rounded-full bg-slate-800/80 overflow-hidden border border-white/5">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-400 transition-all duration-300"
                    style={{ width: `${selectedCourse.progressPercent}%` }}
                  />
                </div>
                <span className="text-xs font-bold text-indigo-400">{selectedCourse.progressPercent}%</span>
              </div>
            </div>

            <button
              onClick={() => {
                toggleCourseDownload(selectedCourse.id);
                setSelectedCourse((prev) => (prev ? { ...prev, isDownloaded: !prev.isDownloaded } : null));
              }}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-2xl text-xs font-bold transition ${
                selectedCourse.isDownloaded
                  ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-400'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/30 border border-indigo-400/30'
              }`}
            >
              {selectedCourse.isDownloaded ? (
                <>
                  <CheckCircle className="w-4 h-4" />
                  <span>Cached Offline</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Download ({selectedCourse.downloadSizeMb} MB)</span>
                </>
              )}
            </button>
          </div>

          {/* Lessons List */}
          <div className="space-y-3">
            <h4 className="text-[10px] uppercase tracking-[0.2em] font-extrabold text-slate-400 px-1">Interactive Lessons</h4>

            {selectedCourse.lessons.map((lesson) => (
              <div
                key={lesson.id}
                className={`p-4 rounded-2xl border backdrop-blur-2xl transition space-y-2 ${
                  lesson.completed
                    ? 'bg-slate-900/70 border-emerald-500/30'
                    : 'bg-slate-900/60 border-white/10 hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <button
                      onClick={() => toggleLessonCompletion(selectedCourse.id, lesson.id)}
                      className={`p-2 rounded-xl transition ${
                        lesson.completed
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-slate-800/80 text-slate-400 hover:text-white border border-white/5'
                      }`}
                    >
                      <CheckCircle className="w-4 h-4" />
                    </button>
                    <div>
                      <h5 className="text-xs font-bold text-slate-100">{lesson.title}</h5>
                      <span className="text-[10px] text-slate-400">{lesson.duration}</span>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/70 p-3 rounded-xl border border-white/5">
                  {lesson.content}
                </p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Course Catalog List */
        <div className="grid gap-4">
          {displayedCourses.map((course) => (
            <motion.div
              key={course.id}
              whileHover={{ y: -2 }}
              className="p-4 rounded-3xl bg-slate-900/60 border border-white/10 backdrop-blur-2xl shadow-xl space-y-3"
            >
              <div className="flex gap-3">
                <img
                  src={course.thumbnail}
                  alt={course.title}
                  referrerPolicy="no-referrer"
                  className="w-20 h-20 rounded-2xl object-cover border border-white/10 shrink-0"
                />
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[9px] font-semibold">
                      {course.level}
                    </span>
                    {course.isDownloaded && (
                      <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                        <HardDrive className="w-3 h-3" />
                        Cached
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm font-bold text-slate-100 line-clamp-1">{course.title}</h3>
                  <p className="text-xs text-slate-400 line-clamp-2">{course.description}</p>
                </div>
              </div>

              {/* Progress bar */}
              <div className="space-y-1 pt-1">
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>Instructor: {course.instructor}</span>
                  <span className="font-bold text-indigo-400">{course.progressPercent}% Completed</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-800/80 overflow-hidden border border-white/5">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-400"
                    style={{ width: `${course.progressPercent}%` }}
                  />
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-between pt-2 border-t border-white/10">
                <button
                  onClick={() => toggleCourseDownload(course.id)}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-medium transition ${
                    course.isDownloaded
                      ? 'text-slate-400 hover:text-rose-400 hover:bg-rose-500/10'
                      : 'text-indigo-400 hover:bg-indigo-500/10'
                  }`}
                >
                  {course.isDownloaded ? (
                    <>
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Clear Offline Cache</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-3.5 h-3.5" />
                      <span>Save Offline ({course.downloadSizeMb} MB)</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => setSelectedCourse(course)}
                  className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition flex items-center gap-1 shadow-lg shadow-indigo-500/20 border border-indigo-400/30"
                >
                  <Play className="w-3 h-3 fill-white" />
                  <span>Start Lessons</span>
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};
