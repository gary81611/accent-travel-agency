export type Database = {
  public: {
    Tables: {
      trips: {
        Row: {
          id: string;
          title: string;
          slug: string;
          destination: string;
          description: string;
          dates: string | null;
          price: string | null;
          featured: boolean;
          created_at: string;
          status: string | null;
          status_note: string | null;
          duration: string | null;
          meals: string | null;
          brochure_url: string | null;
        };
        Insert: {
          id?: string;
          title: string;
          slug: string;
          destination: string;
          description?: string;
          dates?: string | null;
          price?: string | null;
          featured?: boolean;
          created_at?: string;
          status?: string | null;
          status_note?: string | null;
          duration?: string | null;
          meals?: string | null;
          brochure_url?: string | null;
        };
        Update: {
          id?: string;
          title?: string;
          slug?: string;
          destination?: string;
          description?: string;
          dates?: string | null;
          price?: string | null;
          featured?: boolean;
          created_at?: string;
          status?: string | null;
          status_note?: string | null;
          duration?: string | null;
          meals?: string | null;
          brochure_url?: string | null;
        };
        Relationships: [];
      };
      itineraries: {
        Row: {
          id: string;
          trip_id: string;
          day_number: number;
          title: string;
          description: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          trip_id: string;
          day_number: number;
          title: string;
          description?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          trip_id?: string;
          day_number?: number;
          title?: string;
          description?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      photos: {
        Row: {
          id: string;
          trip_id: string;
          storage_path: string;
          caption: string | null;
          display_order: number;
          display_shape: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          trip_id: string;
          storage_path: string;
          caption?: string | null;
          display_order?: number;
          display_shape?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          trip_id?: string;
          storage_path?: string;
          caption?: string | null;
          display_order?: number;
          display_shape?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      pages: {
        Row: {
          id: string;
          slug: string;
          title: string;
          content: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          title: string;
          content?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          title?: string;
          content?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      settings: {
        Row: {
          id: string;
          key: string;
          value: string;
        };
        Insert: {
          id?: string;
          key: string;
          value?: string;
        };
        Update: {
          id?: string;
          key?: string;
          value?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
