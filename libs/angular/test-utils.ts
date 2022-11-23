export async function awaitAsync(ms = 0) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}
