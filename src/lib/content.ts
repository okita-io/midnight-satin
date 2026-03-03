/**
 * Content data layer for Boudoir, Library, Novel Detail, etc.
 * Task 5.1 will implement real fetching (getFeaturedNovels, getTrendingNovels, cache, blob).
 * Until then, returns mock data for UI development.
 */

import type { Novel } from "./db/types";

export interface FeaturedNovel extends Novel {
  authorName: string;
}

export interface CurrentReading {
  novel: Novel & { authorName: string };
  chapterNumber: number;
  chapterTitle: string;
  scrollPercent: number;
  chapterId: string;
}

/** Mock featured novels for hero carousel. Replace with getFeaturedNovels when task 5.1 is done. */
export async function getFeaturedNovels(): Promise<FeaturedNovel[]> {
  return MOCK_FEATURED;
}

/** Mock trending novels for High Society. Replace with getTrendingNovels when task 5.1 is done. */
export async function getTrendingNovels(): Promise<FeaturedNovel[]> {
  return MOCK_TRENDING;
}

/** Mock current reading for registered reader. Replace with real query when task 5.1 + reading progress is done. */
export async function getCurrentReading(readerId: string): Promise<CurrentReading | null> {
  void readerId; // Used when real content layer is implemented
  return MOCK_CURRENT_READING;
}

const MOCK_FEATURED: FeaturedNovel[] = [
  {
    id: "novel-1",
    title: "The Duke's Forbidden Vow",
    seriesId: null,
    authorId: "author-1",
    coverImageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuB0FWAoY-qpFwIzQY_6NmtA-SM2ncwUiYZAEuYUEBom83LsxojIR6fgowWoE7PdG45wh2SSerECtQEUEHwxh6gRhXL-oNcyaZnuPwqItJdMvc-t7COhLSmV-06APiGC5HxJHdnezjXuFWJq0Fb5YZGjzyZ2qWd7Fq4ZLmiYLQK5LhcyaZl5pnP1XTbM51FlwZgCE5UOUSmdUXEkF48IbBGIejauxbuRCBVIt-yzfoiuyZK2WXMMIlJ2pnr6kn0_HXLqvqcwecc6uPg",
    synopsis: null,
    genreTags: [],
    rating: 4.8,
    ratingCount: 0,
    publicationDate: null,
    createdAt: new Date(),
    authorName: "Eleanor Vane",
  },
];

const MOCK_TRENDING: FeaturedNovel[] = [
  {
    id: "novel-2",
    title: "Midnight Masquerade",
    seriesId: null,
    authorId: "author-2",
    coverImageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuD-jy2ntZScXPc-EgaGAc38KBI_YhRUYl1mRN7RcxuAMIkJKii9F6LQVCyKNHjGMkG-bpoQHKVUgshJTcK7ahZLGBwx4-q33Y93lGSjfvWRqUOAY7lVcD7HlnrVjx2U_fOeB7BCQ50F9uXL6xQutaqSXbeCFakke4N5xVonnwcoNHlOLL25VqfbCQvEIUL0FU-cItwo0L9VDmlz6HoE9jYd8iT4eM7fGYnw-9FuYJW0T_JRCQAYNxCg-zHtXE9_kMGAtQ0Bpw3KjfM",
    synopsis: null,
    genreTags: [],
    rating: 4.9,
    ratingCount: 0,
    publicationDate: null,
    createdAt: new Date(),
    authorName: "Viscount Blackwood",
  },
  {
    id: "novel-3",
    title: "The Scarlet Letter",
    seriesId: null,
    authorId: "author-3",
    coverImageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuA4ZMzPWHir-QvitLQbaWtq4dkFiPYU6TuxAkUlh8e7EMYfQCA7XGHEMxZ5kCmImqqWOoprsDJulEVGttbT5dft2cwYphTirdVBL94HfJ0wmaYZRRLv8VfS_pJ_wnuXW9RVHpyXkQz70b7yfeWSI-F_Bx_l041NwTTtKRAEkqWusrevXWjry40WUbYn_JUMwutYWxNCAmpWktj9wUfZeBxzQyDuY_ZoGn92IsqH_XNeiTWQPNweIcCVrfq2kcs2IBjk9Y_8h_BejII",
    synopsis: null,
    genreTags: [],
    rating: 0,
    ratingCount: 0,
    publicationDate: null,
    createdAt: new Date(),
    authorName: "Nathaniel H.",
  },
  {
    id: "novel-4",
    title: "Bound by Silk",
    seriesId: null,
    authorId: "author-4",
    coverImageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCY1pJAtpkQP521addbeH3ObF1aIwimoWU1DKFSD9KynOt_BOaB1S2m7uqIVRyb5AL0met6Ksqfu4FZnafL-cxBD6qjY4o14ty_pGBrHDuRO4Lov2i6I9nwy5NbNlT3Sb0Z0XPPrHOmPiu55QEn8xdsSKgGWRSG66m06bAJjx7x4kqvDJdvUC3QTpWrzhqiuG_-25bLbaD6dee6titau2aXK4weEE8FKdOJYuvZ8bKQLuFqEzCEhlM7TNoHI6QFNQPVD7GJVw9UTII",
    synopsis: null,
    genreTags: [],
    rating: 4.7,
    ratingCount: 0,
    publicationDate: null,
    createdAt: new Date(),
    authorName: "Eliza Montrose",
  },
];

const MOCK_CURRENT_READING: CurrentReading = {
  novel: {
    id: "novel-5",
    title: "Velvet & Steel",
    seriesId: null,
    authorId: "author-5",
    coverImageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAWXl4paH8tw-7BvkMnhTPKLjxmH8nThGmIcJeuhJZPdKWjxlAWYmi7DyGcd_N69mMiQbQWRhAEEfrTzdg0ytX2spYJAfUvK078OxLP-FJc6Z-Va0c2GDJZokObdYp6apJxfZTlK3I1AjePZQ4kBh4PEVaFWCjwuhVIx86uIvZpPwEJ3AlnUzGm6iKE-z4IaiLpULC0-FB6UxQR9b8DNqQUHNoY4B_myjf3pILuGeYPCSzWmmH0vvDG_zsU8gekBdSPvpsal41NIU4",
    synopsis: null,
    genreTags: [],
    rating: 0,
    ratingCount: 0,
    publicationDate: null,
    createdAt: new Date(),
    authorName: "Lady Margaret Thorne",
  },
  chapterNumber: 4,
  chapterTitle: "Chapter IV",
  scrollPercent: 65,
  chapterId: "chapter-4",
};
