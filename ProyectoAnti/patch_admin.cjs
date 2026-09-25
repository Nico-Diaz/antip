const fs = require('fs');

let content = fs.readFileSync('src/pages/admin.astro', 'utf8');

const startStr = "for (const section of mainSections) {";
const endStr = "adminSectionsContainer.innerHTML = html;";

const startIdx = content.indexOf(startStr);
const endIdx = content.indexOf(endStr, startIdx);

if (startIdx !== -1 && endIdx !== -1) {
    const newLoop = `
        async function buildSectionHtml(section, isSub = false) {
          const videosRes = await fetch('/api/videos/upload?section_id=' + section.id);
          const videosData = await safeFetchJson(videosRes, 'Error al obtener videos');
          const videos = videosData.videos || [];

          let sh = '';
          const margin = isSub ? 'ml-8 mt-6 border-l-4 border-[#0073CF]' : '';
          const titlePrefix = isSub ? '↳ ' : '';
          
          sh += '<div class="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-6 transition-all ' + margin + '" id="admin-section-' + section.id + '">';
          
          sh += '<div class="flex items-start justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800 cursor-pointer select-none toggle-section-header" data-section-id="' + section.id + '">';
          sh += '<div class="flex items-center gap-3"><svg class="chevron-icon w-6 h-6 text-slate-400 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>';
          sh += '<div><h3 class="text-xl font-bold text-[#06203D] dark:text-white">' + titlePrefix + section.title + '</h3>';
          if (section.description) {
            sh += '<p class="text-slate-500 dark:text-slate-400 text-sm mt-1">' + section.description + '</p>';
          }
          sh += '</div></div>';

          sh += '<div class="flex items-center gap-3 shrink-0" onclick="event.stopPropagation()">';
          sh += '<span class="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700">' + videos.length + ' videos</span>';
          sh += '<button class="toggle-section-btn bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold px-3 py-1.5 rounded-xl text-xs transition border border-slate-300 dark:border-slate-600 flex items-center gap-1" data-section-id="' + section.id + '"><span class="toggle-text">Minimizar</span></button>';
          sh += '<button class="delete-section-btn bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 font-semibold px-3.5 py-1.5 rounded-xl text-xs transition flex items-center gap-1" data-section-id="' + section.id + '">Eliminar</button>';
          sh += '</div></div>';

          sh += '<div class="section-content space-y-6" id="section-content-' + section.id + '">';
          
          sh += '<div class="bg-slate-50 dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700"><h4 class="font-bold text-[#06203D] dark:text-white text-sm mb-4 flex items-center gap-2">Publicar Video en esta ' + (isSub ? 'Subsección' : 'Sección') + '</h4>';
          sh += '<form class="upload-video-form space-y-4" data-section-id="' + section.id + '">';
          sh += '<div><label class="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Título del Video *</label><input type="text" class="video-title w-full px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl text-sm text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-[#0073CF]" required /></div>';
          
          sh += '<div class="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-700">';
          sh += '<div><label class="block text-xs font-semibold text-[#06203D] dark:text-slate-200 mb-1">📁 Archivo de Video MP4</label><input type="file" class="video-file w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-600 rounded-xl text-xs focus:ring-2 focus:ring-[#0073CF]" accept="video/mp4,video/webm,video/ogg" /></div>';
          sh += '<div><label class="block text-xs font-semibold text-[#06203D] dark:text-slate-200 mb-1">🔗 O URL del Video</label><input type="url" class="video-url w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-600 rounded-xl text-xs focus:ring-2 focus:ring-[#0073CF]" /></div>';
          sh += '</div>';

          sh += '<div class="grid grid-cols-1 md:grid-cols-2 gap-4 bg-blue-50/50 p-4 rounded-xl border border-blue-100">';
          sh += '<div><label class="block text-xs font-semibold text-[#06203D] mb-1">🖼️ Imagen de Portada</label><input type="file" class="thumb-file w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-[#0073CF]" accept="image/png,image/jpeg,image/webp,image/jpg" /></div>';
          sh += '<div><label class="block text-xs font-semibold text-[#06203D] mb-1">🔗 O URL de Portada</label><input type="url" class="thumb-url w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-[#0073CF]" /></div>';
          sh += '</div>';

          sh += '<div><label class="block text-xs font-medium text-slate-700 mb-1">Descripción</label><textarea class="video-description w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-[#0073CF]" rows="2"></textarea></div>';
          sh += '<div class="flex items-center gap-3 pt-1"><button type="submit" class="submit-btn bg-[#0073CF] hover:bg-blue-700 text-white font-semibold py-2 px-5 rounded-xl text-sm">Publicar Video</button><button type="reset" class="bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold py-2 px-4 rounded-xl text-sm">Limpiar</button></div>';
          sh += '<div class="video-message hidden p-3 rounded-xl text-xs font-medium"></div></form></div>';

          sh += '<div><h4 class="font-bold text-[#06203D] text-sm mb-4">Videos subidos</h4>';
          if (videos.length > 0) {
            sh += '<div class="space-y-3">';
            videos.forEach(function(video) {
              const thumb = getThumbnailUrl(video.video_url, video.thumbnail_url);
              const jsonVideo = JSON.stringify(video).replace(/\\'/g, "&apos;").replace(/\\"/g, '&quot;');

              sh += '<div class="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-slate-300 dark:hover:border-slate-600 transition-all">';
              sh += '<div class="flex items-center gap-4 flex-1 min-w-0">';
              
              if (thumb) {
                sh += '<div class="relative w-24 h-14 rounded-lg overflow-hidden bg-slate-800 flex-shrink-0 group cursor-pointer play-trigger" data-video=\\'' + jsonVideo + '\\'><img src="' + thumb + '" alt="' + video.title + '" class="w-full h-full object-cover group-hover:scale-105 transition-transform" /></div>';
              } else {
                sh += '<div class="w-24 h-14 rounded-lg bg-[#06203D] dark:bg-slate-700 flex items-center justify-center flex-shrink-0 cursor-pointer play-trigger" data-video=\\'' + jsonVideo + '\\'></div>';
              }

              sh += '<div class="min-w-0"><h5 class="font-bold text-[#06203D] dark:text-slate-200 text-sm truncate">' + video.title + '</h5>';
              if (video.description) {
                sh += '<p class="text-slate-500 dark:text-slate-400 text-xs truncate mt-0.5">' + video.description + '</p>';
              }
              sh += '<button class="text-[#0073CF] dark:text-[#3399ff] text-xs font-semibold hover:underline mt-1 play-trigger" data-video=\\'' + jsonVideo + '\\'>Probar Vista Previa</button></div></div>';
              sh += '<div class="flex items-center gap-2 self-end sm:self-center">';
              sh += '<button class="manage-attachments-btn bg-slate-200 hover:bg-slate-300 text-slate-800 px-3.5 py-1.5 rounded-lg text-xs font-semibold" data-video-id="' + video.id + '">Adjuntos</button>';
              sh += '<button class="edit-video-btn bg-slate-200 hover:bg-slate-300 text-slate-800 px-3.5 py-1.5 rounded-lg text-xs font-semibold" data-video=\\'' + jsonVideo + '\\'>Editar</button>';
              sh += '<button class="delete-video-btn bg-red-600 hover:bg-red-700 text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold" data-video-id="' + video.id + '">Eliminar</button>';
              sh += '</div></div>';
            });
            sh += '</div>';
          } else {
            sh += '<p class="text-slate-400 text-sm italic bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700">No hay videos aún.</p>';
          }

          const sectionSubSections = subSections.filter(s => s.parent_id === section.id);
          for(const sub of sectionSubSections) {
             sh += await buildSectionHtml(sub, true);
          }

          sh += '</div></div></div>';
          return sh;
        }

        let html = '';
        for (const section of mainSections) {
          html += await buildSectionHtml(section, false);
        }
        
        `;

    content = content.substring(0, startIdx) + newLoop + content.substring(endIdx);
    fs.writeFileSync('src/pages/admin.astro', content);
    console.log("Patched admin.astro");
} else {
    console.log("Could not find admin.astro target");
}
