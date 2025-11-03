function BackgroundVideo() {
  return (
    <video
      autoPlay
      loop
      muted
      playsInline
      poster="/herobg.jpg"
      className="absolute md:top-0 right-0 w-full h-full pointer-events-none select-none -z-10 object-none"
    >
      <source src="/herobg.webm" type="video/webm" />
      <source src="/herobg.mp4" type="video/mp4" />
    </video>
  )
}

export default BackgroundVideo
