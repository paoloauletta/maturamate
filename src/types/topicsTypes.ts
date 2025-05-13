/**
 * Core type definitions for the MaturaMate topics and subtopics system
 */

/**
 * Base Types
 */

export interface TopicType {
  id: string;
  name: string;
  description: string | null;
  order_index: number | null;
}

export interface SubtopicType {
  id: string;
  topic_id: string;
  name: string;
  order_index: number | null;
}

/**
 * Composite Types
 */

export interface TopicWithSubtopicsType extends TopicType {
  subtopics: SubtopicType[];
}

/**
 * For backwards compatibility with sidebar component
 */
export interface SidebarSubtopicType extends SubtopicType {}
export interface SidebarTopicType extends TopicWithSubtopicsType {}
