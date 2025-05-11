  let isPublished = true;
  let isPrivate = false;
  let coverImage: string | null = null;

  <div class="flex flex-col gap-4">
    <div class="flex items-center gap-4">
      <label class="flex items-center gap-2 cursor-pointer">
        <input type="checkbox" bind:checked={isPublished} class="checkbox" />
        <span class="text-sm">Publish immediately</span>
      </label>
      <div class="flex items-center gap-2">
        <span class="text-sm">Privacy:</span>
        <button
          type="button"
          class:active={!isPrivate}
          class="px-3 py-1 rounded border focus:outline-none {isPrivate ? 'bg-white text-gray-700 border-gray-300' : 'bg-blue-600 text-white border-blue-600'}"
          on:click={() => isPrivate = false}
        >Public</button>
        <button
          type="button"
          class:active={isPrivate}
          class="px-3 py-1 rounded border focus:outline-none {isPrivate ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300'}"
          on:click={() => isPrivate = true}
        >Private</button>
      </div>
    </div>

  async function handleSubmit() {
    if (!title || segments.length === 0) return;
    
    try {
      const thread = await threadService.createThread(
        title,
        segments,
        selectedTags,
        coverImage,
        isPublished,
        isPrivate
      );
    } catch (error) {
      console.error('Error creating thread:', error);
    }
  }
} 