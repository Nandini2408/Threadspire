  <div class="flex flex-col gap-4">
    {#each threads as thread}
      <div class="bg-white rounded-lg shadow p-4">
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <h3 class="text-lg font-semibold">{thread.title}</h3>
            <p class="text-sm text-gray-500">
              {#if thread.is_private}
                <span class="inline-flex items-center gap-1 text-yellow-600">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd" />
                  </svg>
                  Private
                </span>
              {/if}
              by {thread.user?.name || 'Anonymous'}
            </p>
          </div>
        </div>
      </div>
    {/each}
  </div> 