import { nprogress } from '@mantine/nprogress';

export function onStart() {
  nprogress.start()
}

export function onComplete() {
  nprogress.complete()
}
