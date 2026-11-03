<script lang="ts">
  import ChevronLeft from "lucide-svelte/icons/chevron-left";
  import ChevronRight from "lucide-svelte/icons/chevron-right";
  import Play from "lucide-svelte/icons/play";
  import Pause from "lucide-svelte/icons/pause";
  import Volume2 from "lucide-svelte/icons/volume-2";
  import VolumeX from "lucide-svelte/icons/volume-x";
  import Maximize2 from "lucide-svelte/icons/maximize-2";
  import RotateCcw from "lucide-svelte/icons/rotate-ccw";
  import Revelar from "~/components/ui/Revelar.svelte";

  const videoTestimonials = [
    {
      id: 1,
      name: "Cliente Satisfecho Testimonio 1",
      videoUrl: "https://s3.suncarsrl.com/testimonios/T1.mp4",
      thumbnail: "/placeholder.jpg",
      description: "Experiencia real de instalación de paneles solares con SunCar",
    },
    {
      id: 2,
      name: "Cliente Satisfecho Testimonio 2",
      videoUrl: "https://s3.suncarsrl.com/testimonios/T2.mp4",
      thumbnail: "/placeholder.jpg",
      description: "Testimonio de cliente satisfecho con su instalación de energía solar",
    },
  ];

  let currentVideo = $state(0);
  let isMuted = $state(false);
  let videoError = $state(false);
  let videoEl: HTMLVideoElement | null = $state(null);

  // Se enlazan al <video>; al cambiar de testimonio el elemento se recrea
  // (bloque {#key}) y vuelven a empezar de cero.
  let currentTime = $state(0);
  let duration = $state(0);
  let paused = $state(true);

  const actual = $derived(videoTestimonials[currentVideo]);
  const total = $derived(Number.isFinite(duration) ? duration : 0);

  const cambiarA = (indice: number) => {
    currentVideo = indice;
    videoError = false;
  };
  const nextVideo = () => cambiarA((currentVideo + 1) % videoTestimonials.length);
  const prevVideo = () =>
    cambiarA((currentVideo - 1 + videoTestimonials.length) % videoTestimonials.length);

  const togglePlay = () => {
    if (!videoEl) return;
    if (videoEl.paused) videoEl.play().catch(() => (videoError = true));
    else videoEl.pause();
  };

  const toggleMute = () => {
    isMuted = !isMuted;
  };

  const resetVideo = () => {
    if (!videoEl) return;
    videoEl.currentTime = 0;
    videoEl.pause();
  };

  const toggleFullscreen = () => {
    if (!videoEl) return;
    if (document.fullscreenElement) document.exitFullscreen?.();
    else videoEl.requestFullscreen?.();
  };

  const handleSeek = (e: Event) => {
    if (!videoEl) return;
    videoEl.currentTime = parseFloat((e.currentTarget as HTMLInputElement).value);
  };

  const formatTime = (time: number) => {
    const t = Number.isFinite(time) ? time : 0;
    const minutes = Math.floor(t / 60);
    const seconds = Math.floor(t % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };
</script>

<Revelar retraso={100} class="relative max-w-5xl mx-auto">
  <div class="bg-white rounded-3xl shadow-2xl overflow-hidden transform hover:scale-[1.02] transition-all duration-500">
    <div class="relative group">
      {#key actual.id}
        <video
          bind:this={videoEl}
          bind:currentTime
          bind:duration
          bind:paused
          muted={isMuted}
          class="w-full aspect-video object-cover"
          poster={actual.thumbnail}
          preload="metadata"
          playsinline
          onerror={() => (videoError = true)}
        >
          <source src={actual.videoUrl} type="video/mp4" onerror={() => (videoError = true)} />
          Tu navegador no soporta la reproducción de video.
        </video>
      {/key}

      {#if videoError}
        <div class="absolute inset-0 bg-black/70 flex flex-col items-center justify-center gap-3 px-6 text-center z-10">
          <p class="text-white font-semibold">No se pudo cargar el video</p>
          <p class="text-white/70 text-sm">Inténtalo de nuevo en unos minutos.</p>
        </div>
      {/if}

      {#if !videoError}
        <div class="absolute inset-0 bg-black/0 md:group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
          <button
            type="button"
            onclick={togglePlay}
            aria-label={paused ? "Reproducir video" : "Pausar video"}
            class="w-20 h-20 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-primary shadow-xl hover:bg-white hover:scale-110 transition-all duration-300 opacity-90 md:opacity-0 md:group-hover:opacity-100"
          >
            {#if paused}
              <Play class="w-10 h-10 ml-1" />
            {:else}
              <Pause class="w-10 h-10" />
            {/if}
          </button>
        </div>
      {/if}

      <div class="absolute bottom-0 left-0 right-0 bg-black/50 backdrop-blur-sm p-4">
        <div class="flex items-center gap-4 text-white">
          <button
            type="button"
            onclick={togglePlay}
            aria-label={paused ? "Reproducir video" : "Pausar video"}
            class="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
          >
            {#if paused}
              <Play class="w-5 h-5 ml-0.5" />
            {:else}
              <Pause class="w-5 h-5" />
            {/if}
          </button>

          <div class="flex-1">
            <input
              type="range"
              min="0"
              max={total}
              value={currentTime}
              oninput={handleSeek}
              aria-label="Posición del video"
              class="w-full h-2 bg-white/30 rounded-lg appearance-none cursor-pointer slider"
            />
          </div>

          <span class="text-sm font-mono min-w-[60px]">
            {formatTime(currentTime)} / {formatTime(total)}
          </span>

          <button
            type="button"
            onclick={toggleMute}
            aria-label={isMuted ? "Activar sonido" : "Silenciar"}
            class="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
          >
            {#if isMuted}
              <VolumeX class="w-5 h-5" />
            {:else}
              <Volume2 class="w-5 h-5" />
            {/if}
          </button>

          <button
            type="button"
            onclick={resetVideo}
            aria-label="Reiniciar video"
            class="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
          >
            <RotateCcw class="w-5 h-5" />
          </button>

          <button
            type="button"
            onclick={toggleFullscreen}
            aria-label="Pantalla completa"
            class="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
          >
            <Maximize2 class="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>

    <div class="p-8">
      <div class="text-center space-y-4">
        <div class="flex items-center justify-center gap-4">
          <div class="w-16 h-16 bg-[#012928] rounded-full flex items-center justify-center text-white font-bold text-xl">
            {actual.name.charAt(0)}
          </div>
          <div>
            <div class="font-bold text-primary text-2xl">{actual.name}</div>
          </div>
        </div>
        <p class="text-gray-600 max-w-2xl mx-auto">{actual.description}</p>
      </div>
    </div>
  </div>

  <button
    type="button"
    onclick={prevVideo}
    aria-label="Testimonio anterior"
    class="absolute left-4 top-1/2 -translate-y-1/2 w-14 h-14 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-primary shadow-xl hover:bg-white hover:scale-110 transition-all duration-300 z-10"
  >
    <ChevronLeft class="w-8 h-8" />
  </button>

  <button
    type="button"
    onclick={nextVideo}
    aria-label="Testimonio siguiente"
    class="absolute right-4 top-1/2 -translate-y-1/2 w-14 h-14 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-primary shadow-xl hover:bg-white hover:scale-110 transition-all duration-300 z-10"
  >
    <ChevronRight class="w-8 h-8" />
  </button>

  <div class="flex justify-center gap-3 mt-8">
    {#each videoTestimonials as testimonio, index (testimonio.id)}
      <button
        type="button"
        onclick={() => cambiarA(index)}
        aria-label={`Ver testimonio ${index + 1}`}
        class={`w-3 h-3 rounded-full transition-all duration-300 ${
          currentVideo === index ? "bg-primary scale-125" : "bg-gray-300 hover:bg-primary/50"
        }`}
      ></button>
    {/each}
  </div>

  <div class="text-center mt-4 text-gray-500">
    {currentVideo + 1} de {videoTestimonials.length} testimonios
  </div>
</Revelar>
