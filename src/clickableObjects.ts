/**
 * Metadata for objects in the scene that can be clicked.
 * Positions and scales are in world space; hotspot meshes are invisible and used only for raycasting.
 */
export type ClickableObject = {
  id: string
  name: string
  description: string
  /** URL for the image shown in the dialog (can be external or /path in public) */
  imageUrl: string
  /** Center position [x, y, z] in meters */
  position: [number, number, number]
  /** Box size (full extents) [x, y, z] in meters */
  scale: [number, number, number]
  /** Optional Euler rotation [x, y, z] in radians (e.g. to orient a wall-mounted TV) */
  rotation?: [number, number, number]
}

/** Predefined clickable objects: chair, sofa, TV, image frame. Adjust position/scale to match your room.splat layout. */
export const CLICKABLE_OBJECTS: ClickableObject[] = [
  {
    id: "chair",
    name: "Chair",
    description:
      "A comfortable armchair perfect for reading or relaxing. Features a sturdy frame and soft upholstery.",
    imageUrl: "/images/chair.png",
    position: [1.8, 0.45, 0.5],
    scale: [0.7, 0.9, 0.7],
  },
  {
    id: "sofa",
    name: "Sofa",
    description:
      "A spacious three-seater sofa with plush cushions. Ideal for the living room and casual seating.",
    imageUrl: "/images/sofa.png",
    position: [-2.2, 0.5, -2.5],
    scale: [2.2, 0.95, 1.0],
  },
  {
    id: "tv",
    name: "TV",
    description:
      "A flat-screen television mounted on the wall. Great for movies and entertainment.",
    imageUrl: "/images/television.png",
    position: [0, 1.55, 5.2],
    // TV-shaped mesh: wide × tall × thin (flat panel, ~16:9), wall-mounted
    scale: [1.6, 0.9, 0.08],
    rotation: [0, 0, 0],
  },
  {
    id: "image-frame",
    name: "Image Frame",
    description:
      "A framed artwork or photograph on the wall. Adds character and style to the room.",
    imageUrl: "https://placehold.co/400x300/transparent/6b6358?text=Picture+Frame",
    position: [3.8, 2.0, 5.3],
    scale: [0.85, 0.65, 0.06],
  },
]
