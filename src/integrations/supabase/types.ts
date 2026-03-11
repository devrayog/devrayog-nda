export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      achievements: {
        Row: {
          category: string
          created_at: string
          criteria_json: Json
          description: string
          hidden: boolean
          icon: string
          id: string
          key: string
          title: string
        }
        Insert: {
          category?: string
          created_at?: string
          criteria_json?: Json
          description: string
          hidden?: boolean
          icon?: string
          id?: string
          key: string
          title: string
        }
        Update: {
          category?: string
          created_at?: string
          criteria_json?: Json
          description?: string
          hidden?: boolean
          icon?: string
          id?: string
          key?: string
          title?: string
        }
        Relationships: []
      }
      admin_settings: {
        Row: {
          id: string
          key: string
          updated_at: string
          value: string | null
        }
        Insert: {
          id?: string
          key: string
          updated_at?: string
          value?: string | null
        }
        Update: {
          id?: string
          key?: string
          updated_at?: string
          value?: string | null
        }
        Relationships: []
      }
      bookmarks: {
        Row: {
          created_at: string
          id: string
          item_id: string
          item_type: string
          metadata: Json | null
          title: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          item_id: string
          item_type: string
          metadata?: Json | null
          title?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          item_id?: string
          item_type?: string
          metadata?: Json | null
          title?: string | null
          user_id?: string
        }
        Relationships: []
      }
      chat_history: {
        Row: {
          context: Json | null
          conversation_id: string
          created_at: string
          id: string
          messages: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          context?: Json | null
          conversation_id?: string
          created_at?: string
          id?: string
          messages?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          context?: Json | null
          conversation_id?: string
          created_at?: string
          id?: string
          messages?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          channel: string
          content: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          channel?: string
          content: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          channel?: string
          content?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      community_posts: {
        Row: {
          category: string | null
          content: string
          created_at: string
          id: string
          is_pinned: boolean | null
          likes_count: number | null
          replies_count: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: string | null
          content: string
          created_at?: string
          id?: string
          is_pinned?: boolean | null
          likes_count?: number | null
          replies_count?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string | null
          content?: string
          created_at?: string
          id?: string
          is_pinned?: boolean | null
          likes_count?: number | null
          replies_count?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      current_affairs: {
        Row: {
          body: string | null
          category: string
          created_at: string
          created_by: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          is_featured: boolean | null
          link: string | null
          published_at: string
          title: string
        }
        Insert: {
          body?: string | null
          category?: string
          created_at?: string
          created_by?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          is_featured?: boolean | null
          link?: string | null
          published_at?: string
          title: string
        }
        Update: {
          body?: string | null
          category?: string
          created_at?: string
          created_by?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          is_featured?: boolean | null
          link?: string | null
          published_at?: string
          title?: string
        }
        Relationships: []
      }
      error_log: {
        Row: {
          correct_answer: string
          created_at: string
          explanation: string | null
          id: string
          mastered: boolean | null
          next_review_at: string | null
          question: string
          review_count: number | null
          source: string | null
          subject: string | null
          topic: string | null
          user_answer: string
          user_id: string
        }
        Insert: {
          correct_answer: string
          created_at?: string
          explanation?: string | null
          id?: string
          mastered?: boolean | null
          next_review_at?: string | null
          question: string
          review_count?: number | null
          source?: string | null
          subject?: string | null
          topic?: string | null
          user_answer: string
          user_id: string
        }
        Update: {
          correct_answer?: string
          created_at?: string
          explanation?: string | null
          id?: string
          mastered?: boolean | null
          next_review_at?: string | null
          question?: string
          review_count?: number | null
          source?: string | null
          subject?: string | null
          topic?: string | null
          user_answer?: string
          user_id?: string
        }
        Relationships: []
      }
      faqs: {
        Row: {
          answer: string
          category: string | null
          created_at: string
          id: string
          is_active: boolean | null
          question: string
          sort_order: number | null
        }
        Insert: {
          answer: string
          category?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          question: string
          sort_order?: number | null
        }
        Update: {
          answer?: string
          category?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          question?: string
          sort_order?: number | null
        }
        Relationships: []
      }
      feedback: {
        Row: {
          created_at: string
          id: string
          message: string
          status: string | null
          type: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          status?: string | null
          type?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          status?: string | null
          type?: string
          user_id?: string | null
        }
        Relationships: []
      }
      guide_sections: {
        Row: {
          content: string
          created_at: string
          icon: string | null
          id: string
          is_active: boolean | null
          sort_order: number | null
          title: string
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          icon?: string | null
          id?: string
          is_active?: boolean | null
          sort_order?: number | null
          title: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          icon?: string | null
          id?: string
          is_active?: boolean | null
          sort_order?: number | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      mock_test_questions: {
        Row: {
          correct_option: string
          created_at: string
          difficulty: string | null
          explanation: string | null
          id: string
          is_active: boolean | null
          option_a: string
          option_b: string
          option_c: string
          option_d: string
          question: string
          sort_order: number | null
          test_id: string
        }
        Insert: {
          correct_option?: string
          created_at?: string
          difficulty?: string | null
          explanation?: string | null
          id?: string
          is_active?: boolean | null
          option_a: string
          option_b: string
          option_c: string
          option_d: string
          question: string
          sort_order?: number | null
          test_id: string
        }
        Update: {
          correct_option?: string
          created_at?: string
          difficulty?: string | null
          explanation?: string | null
          id?: string
          is_active?: boolean | null
          option_a?: string
          option_b?: string
          option_c?: string
          option_d?: string
          question?: string
          sort_order?: number | null
          test_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mock_test_questions_test_id_fkey"
            columns: ["test_id"]
            isOneToOne: false
            referencedRelation: "resources"
            referencedColumns: ["id"]
          },
        ]
      }
      notes: {
        Row: {
          content: string | null
          created_at: string
          id: string
          subject: string | null
          tags: string[] | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          id?: string
          subject?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string | null
          created_at?: string
          id?: string
          subject?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      notification_preferences: {
        Row: {
          community_replies: boolean
          created_at: string
          current_affairs_update: boolean
          daily_study_reminder: boolean
          exam_countdown_alerts: boolean
          id: string
          mock_test_reminder: boolean
          news_time: string
          streak_reminder: boolean
          study_reminder_time: string
          updated_at: string
          user_id: string
        }
        Insert: {
          community_replies?: boolean
          created_at?: string
          current_affairs_update?: boolean
          daily_study_reminder?: boolean
          exam_countdown_alerts?: boolean
          id?: string
          mock_test_reminder?: boolean
          news_time?: string
          streak_reminder?: boolean
          study_reminder_time?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          community_replies?: boolean
          created_at?: string
          current_affairs_update?: boolean
          daily_study_reminder?: boolean
          exam_countdown_alerts?: boolean
          id?: string
          mock_test_reminder?: boolean
          news_time?: string
          streak_reminder?: boolean
          study_reminder_time?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          message: string
          read: boolean | null
          title: string
          type: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          read?: boolean | null
          title: string
          type?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          read?: boolean | null
          title?: string
          type?: string | null
          user_id?: string
        }
        Relationships: []
      }
      post_likes: {
        Row: {
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      post_replies: {
        Row: {
          content: string
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_replies_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          accuracy: number | null
          attempt: string | null
          avatar_url: string | null
          challenge: string | null
          cleared_written: string | null
          created_at: string
          dna_score: number | null
          email: string | null
          full_name: string | null
          id: string
          is_girl: boolean | null
          medium: string | null
          service: string | null
          state: string | null
          streak: number | null
          study_time: string | null
          target_exam: string | null
          total_questions_solved: number | null
          updated_at: string
          user_id: string
          username: string | null
        }
        Insert: {
          accuracy?: number | null
          attempt?: string | null
          avatar_url?: string | null
          challenge?: string | null
          cleared_written?: string | null
          created_at?: string
          dna_score?: number | null
          email?: string | null
          full_name?: string | null
          id?: string
          is_girl?: boolean | null
          medium?: string | null
          service?: string | null
          state?: string | null
          streak?: number | null
          study_time?: string | null
          target_exam?: string | null
          total_questions_solved?: number | null
          updated_at?: string
          user_id: string
          username?: string | null
        }
        Update: {
          accuracy?: number | null
          attempt?: string | null
          avatar_url?: string | null
          challenge?: string | null
          cleared_written?: string | null
          created_at?: string
          dna_score?: number | null
          email?: string | null
          full_name?: string | null
          id?: string
          is_girl?: boolean | null
          medium?: string | null
          service?: string | null
          state?: string | null
          streak?: number | null
          study_time?: string | null
          target_exam?: string | null
          total_questions_solved?: number | null
          updated_at?: string
          user_id?: string
          username?: string | null
        }
        Relationships: []
      }
      pyq_questions: {
        Row: {
          correct_option: string
          created_at: string
          difficulty: string | null
          explanation: string | null
          id: string
          is_active: boolean | null
          option_a: string
          option_b: string
          option_c: string
          option_d: string
          paper: string
          question: string
          subject: string
          topic: string | null
          year: number
        }
        Insert: {
          correct_option?: string
          created_at?: string
          difficulty?: string | null
          explanation?: string | null
          id?: string
          is_active?: boolean | null
          option_a: string
          option_b: string
          option_c: string
          option_d: string
          paper?: string
          question: string
          subject?: string
          topic?: string | null
          year: number
        }
        Update: {
          correct_option?: string
          created_at?: string
          difficulty?: string | null
          explanation?: string | null
          id?: string
          is_active?: boolean | null
          option_a?: string
          option_b?: string
          option_c?: string
          option_d?: string
          paper?: string
          question?: string
          subject?: string
          topic?: string | null
          year?: number
        }
        Relationships: []
      }
      question_reports: {
        Row: {
          admin_notes: string | null
          correct_answer: string | null
          created_at: string
          explanation: string | null
          id: string
          issue_description: string | null
          issue_type: string
          options: Json | null
          question_text: string
          source: string | null
          status: string | null
          user_answer: string | null
          user_id: string
        }
        Insert: {
          admin_notes?: string | null
          correct_answer?: string | null
          created_at?: string
          explanation?: string | null
          id?: string
          issue_description?: string | null
          issue_type?: string
          options?: Json | null
          question_text: string
          source?: string | null
          status?: string | null
          user_answer?: string | null
          user_id: string
        }
        Update: {
          admin_notes?: string | null
          correct_answer?: string | null
          created_at?: string
          explanation?: string | null
          id?: string
          issue_description?: string | null
          issue_type?: string
          options?: Json | null
          question_text?: string
          source?: string | null
          status?: string | null
          user_answer?: string | null
          user_id?: string
        }
        Relationships: []
      }
      resources: {
        Row: {
          body: string | null
          category: string | null
          created_at: string
          created_by: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          link: string | null
          sort_order: number | null
          title: string
          type: string
        }
        Insert: {
          body?: string | null
          category?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          link?: string | null
          sort_order?: number | null
          title: string
          type?: string
        }
        Update: {
          body?: string | null
          category?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          link?: string | null
          sort_order?: number | null
          title?: string
          type?: string
        }
        Relationships: []
      }
      running_logs: {
        Row: {
          created_at: string
          date: string
          distance_km: number
          id: string
          notes: string | null
          time_minutes: number
          user_id: string
        }
        Insert: {
          created_at?: string
          date?: string
          distance_km?: number
          id?: string
          notes?: string | null
          time_minutes?: number
          user_id: string
        }
        Update: {
          created_at?: string
          date?: string
          distance_km?: number
          id?: string
          notes?: string | null
          time_minutes?: number
          user_id?: string
        }
        Relationships: []
      }
      ssb_set_items: {
        Row: {
          content_text: string | null
          created_at: string
          id: string
          image_url: string | null
          set_id: string
          sort_order: number | null
        }
        Insert: {
          content_text?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          set_id: string
          sort_order?: number | null
        }
        Update: {
          content_text?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          set_id?: string
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ssb_set_items_set_id_fkey"
            columns: ["set_id"]
            isOneToOne: false
            referencedRelation: "ssb_sets"
            referencedColumns: ["id"]
          },
        ]
      }
      ssb_sets: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          is_active: boolean | null
          title: string
          type: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          title: string
          type?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          title?: string
          type?: string
        }
        Relationships: []
      }
      study_topics: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          emoji: string | null
          id: string
          is_active: boolean | null
          name: string
          slug: string
          sort_order: number | null
          subject: string
          updated_at: string
          weight: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          emoji?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          slug: string
          sort_order?: number | null
          subject?: string
          updated_at?: string
          weight?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          emoji?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          slug?: string
          sort_order?: number | null
          subject?: string
          updated_at?: string
          weight?: string | null
        }
        Relationships: []
      }
      success_stories: {
        Row: {
          attempts: number | null
          avatar_url: string | null
          batch: string | null
          branch: string | null
          created_at: string
          highlight: string | null
          id: string
          is_active: boolean | null
          name: string
          quote: string | null
          state: string | null
          tips: string[] | null
        }
        Insert: {
          attempts?: number | null
          avatar_url?: string | null
          batch?: string | null
          branch?: string | null
          created_at?: string
          highlight?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          quote?: string | null
          state?: string | null
          tips?: string[] | null
        }
        Update: {
          attempts?: number | null
          avatar_url?: string | null
          batch?: string | null
          branch?: string | null
          created_at?: string
          highlight?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          quote?: string | null
          state?: string | null
          tips?: string[] | null
        }
        Relationships: []
      }
      test_results: {
        Row: {
          ai_analysis: string | null
          correct_answers: number | null
          created_at: string
          id: string
          questions_data: Json | null
          score: number | null
          subject: string | null
          test_type: string
          time_taken_seconds: number | null
          total_questions: number | null
          user_id: string
          wrong_answers: number | null
        }
        Insert: {
          ai_analysis?: string | null
          correct_answers?: number | null
          created_at?: string
          id?: string
          questions_data?: Json | null
          score?: number | null
          subject?: string | null
          test_type: string
          time_taken_seconds?: number | null
          total_questions?: number | null
          user_id: string
          wrong_answers?: number | null
        }
        Update: {
          ai_analysis?: string | null
          correct_answers?: number | null
          created_at?: string
          id?: string
          questions_data?: Json | null
          score?: number | null
          subject?: string | null
          test_type?: string
          time_taken_seconds?: number | null
          total_questions?: number | null
          user_id?: string
          wrong_answers?: number | null
        }
        Relationships: []
      }
      topic_questions: {
        Row: {
          correct_option: string
          created_at: string
          difficulty: string | null
          explanation: string | null
          id: string
          is_active: boolean | null
          option_a: string
          option_b: string
          option_c: string
          option_d: string
          question: string
          topic_id: string
        }
        Insert: {
          correct_option?: string
          created_at?: string
          difficulty?: string | null
          explanation?: string | null
          id?: string
          is_active?: boolean | null
          option_a: string
          option_b: string
          option_c: string
          option_d: string
          question: string
          topic_id: string
        }
        Update: {
          correct_option?: string
          created_at?: string
          difficulty?: string | null
          explanation?: string | null
          id?: string
          is_active?: boolean | null
          option_a?: string
          option_b?: string
          option_c?: string
          option_d?: string
          question?: string
          topic_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "topic_questions_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "study_topics"
            referencedColumns: ["id"]
          },
        ]
      }
      user_achievements: {
        Row: {
          achievement_id: string
          id: string
          unlocked_at: string
          user_id: string
        }
        Insert: {
          achievement_id: string
          id?: string
          unlocked_at?: string
          user_id: string
        }
        Update: {
          achievement_id?: string
          id?: string
          unlocked_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_achievements_achievement_id_fkey"
            columns: ["achievement_id"]
            isOneToOne: false
            referencedRelation: "achievements"
            referencedColumns: ["id"]
          },
        ]
      }
      user_activity: {
        Row: {
          action_type: string
          created_at: string
          duration_seconds: number | null
          id: string
          metadata: Json | null
          page: string | null
          topic: string | null
          user_id: string
        }
        Insert: {
          action_type: string
          created_at?: string
          duration_seconds?: number | null
          id?: string
          metadata?: Json | null
          page?: string | null
          topic?: string | null
          user_id: string
        }
        Update: {
          action_type?: string
          created_at?: string
          duration_seconds?: number | null
          id?: string
          metadata?: Json | null
          page?: string | null
          topic?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      leaderboard_profiles: {
        Row: {
          accuracy: number | null
          avatar_url: string | null
          dna_score: number | null
          full_name: string | null
          service: string | null
          state: string | null
          streak: number | null
          target_exam: string | null
          total_questions_solved: number | null
          user_id: string | null
          username: string | null
        }
        Insert: {
          accuracy?: number | null
          avatar_url?: string | null
          dna_score?: number | null
          full_name?: string | null
          service?: string | null
          state?: string | null
          streak?: number | null
          target_exam?: string | null
          total_questions_solved?: number | null
          user_id?: string | null
          username?: string | null
        }
        Update: {
          accuracy?: number | null
          avatar_url?: string | null
          dna_score?: number | null
          full_name?: string | null
          service?: string | null
          state?: string | null
          streak?: number | null
          target_exam?: string | null
          total_questions_solved?: number | null
          user_id?: string | null
          username?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
