export default class Bookmarks {
   public resourceId?: number;
   public resourceName?: string;
   public resourceImage?: string;
   public resourceType?: string;
}

export interface BookmarkState {
   bookmarkfiles: Bookmarks[];
}

