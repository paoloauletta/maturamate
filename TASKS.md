# Topic/Subtopic Completion Implementation Tasks

## Database and API Updates

1. Create API endpoint for marking a subtopic as completed

   - Create route handler at `/api/subtopics/complete`
   - Accept POST requests with `user_id` and `subtopic_id`
   - Check if entry already exists before creating
   - Return appropriate status codes

2. Create API endpoint for marking a topic as completed

   - Create route handler at `/api/topics/complete`
   - Accept POST requests with `user_id` and `topic_id`
   - Check if entry already exists before creating
   - Return appropriate status codes

3. Create API endpoint for getting completion status
   - Create route handler at `/api/user/completion`
   - Return all completed topics and subtopics for a user
   - Include total counts of topics and subtopics

## Theory Page Updates

4. Add "Mark as Completed" button to each subtopic

   - Add button at the end of each subtopic content
   - Implement click handler to call the subtopic completion API
   - Show visual feedback when a subtopic is completed
   - Disable or change button appearance if already completed

5. Update "Vai al prossimo argomento" button

   - Modify click handler to call the topic completion API
   - Maintain existing navigation functionality
   - Show visual feedback when a topic is completed

6. Update topic sidebar behavior

   - Fetch completed topics/subtopics on page load
   - Collapse completed topics by default
   - Keep uncompleted topics expanded by default
   - Add visual indication of completed topics/subtopics

7. Update redirect logic on theory page
   - Fetch completed topics/subtopics on page load
   - Determine the first uncompleted topic/subtopic in order
   - Redirect to the first uncompleted subtopic when page loads

## Dashboard Updates

9. Add completion statistics card to dashboard

   - Create new card showing topic/subtopic completion stats
   - Show total topics and how many are completed
   - Show completion percentage
   - Add progress bar visualization

10. Add "Continue Learning" button to dashboard
    - Button directs to the first uncompleted subtopic
    - Fetch the first uncompleted topic/subtopic in order
    - Make the button prominent and encouraging

## Statistics Page Updates

11. Add completion statistics card to statistics page
    - Create new card showing topic/subtopic completion status
    - Show total topics and how many are completed
    - Show completion percentage with progress visualization
    - Add "Continue Learning" button to first uncompleted subtopic

## Testing and Refinement

12. Test topic completion functionality

    - Verify completion API endpoints work correctly
    - Test marking topics/subtopics as completed
    - Verify completion state persists across sessions

13. Test redirect functionality

    - Verify redirects to first uncompleted topic/subtopic
    - Test with various completion patterns
    - Ensure redirects don't occur if all topics/subtopics completed

14. Test sidebar behavior

    - Verify completed topics are collapsed by default
    - Verify uncompleted topics are expanded by default
    - Check visual indicators for completed topics/subtopics

15. Review UI/UX of completion indicators
    - Ensure completion status is clearly visible
    - Check accessibility of completion indicators
    - Verify mobile responsiveness of completion features
