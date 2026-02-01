/**
 * Metadata for scene cubes (wardrobe, sofa, chair, etc.) shown in the cube-info dialog.
 */
export type CubeInfo = {
  id: string
  name: string
  description: string
  /** URL for portrait image (white background). */
  imageUrl: string
}

export const CUBE_OBJECTS: Record<string, CubeInfo> = {
  wardrobe: {
    id: "wardrobe",
    name: "Wardrobe",
    imageUrl: "/images/wardrobe.png",
    description:
      "A tall freestanding wardrobe with ample hanging and shelf space for clothing and linens. Built from solid wood with a clean, modern finish, it includes a full-length mirror on one door and soft-close hinges. Ideal for bedrooms or dressing areas to keep the room organized and clutter-free.",
  },
  sofa: {
    id: "sofa",
    name: "Sofa",
    imageUrl: "/images/sofa.png",
    description:
      "A spacious three-seater sofa with deep cushions and a sturdy frame, upholstered in a neutral fabric that fits most living spaces. The design prioritizes comfort for long movie nights or casual conversation, with supportive armrests and a slightly reclined back. Easy to maintain and built to last for years of daily use.",
  },
  chairWithFootRest: {
    id: "chairWithFootRest",
    name: "Chair with foot rest",
    imageUrl: "/images/chairWithFootRest.png",
    description:
      "A comfortable recliner-style chair with an integrated footrest that extends for full relaxation. The padded seat and back provide excellent support, while the footrest helps reduce strain on the legs and lower back. Perfect for reading, napping, or watching television in the living room.",
  },
  chair: {
    id: "chair",
    name: "Chair",
    imageUrl: "/images/chair.png",
    description:
      "A classic armchair with a timeless design and soft upholstery, suitable for living rooms, studies, or corners. The compact footprint and supportive shape make it a versatile piece for seating guests or enjoying a quiet moment. Available in a range of fabrics to match your decor.",
  },
  officeChair: {
    id: "officeChair",
    name: "Office chair",
    imageUrl: "/images/officeChair.png",
    description:
      "An ergonomic office chair with adjustable height, lumbar support, and breathable mesh or padded back to keep you comfortable during long work or study sessions. The armrests and seat tilt can be tuned to your preference, promoting good posture and reducing fatigue throughout the day.",
  },
  speaker: {
    id: "speaker",
    name: "Speaker",
    imageUrl: "/images/speaker.png",
    description:
      "A floor-standing or bookshelf speaker designed to deliver clear, balanced sound for music and home theater. Built with quality drivers and a solid cabinet to minimize vibration, it fills the room with rich audio while fitting neatly into your existing layout. Pairs well with a second unit for stereo listening.",
  },
  television: {
    id: "television",
    name: "Television",
    imageUrl: "/images/television.png",
    description:
      "A flat-screen television with a slim bezel and high-resolution display, suitable for wall mounting or placement on a stand. It supports modern streaming, gaming, and broadcast content with multiple inputs and a user-friendly interface. The screen size and picture quality make it a centerpiece for entertainment in the room.",
  },
  speaker2: {
    id: "speaker2",
    name: "Speaker",
    imageUrl: "/images/speaker.png",
    description:
      "A second speaker unit matching the room’s audio setup, used for stereo imaging or as part of a multi-channel system. Delivers consistent tone and volume to create an immersive listening experience, whether for music, movies, or gaming.",
  },
}
