// Sample Portable Text for the showcase: every post-body block the Studio
// offers, written as a slice of an async I/O post.
const span = (text: string, marks: string[] = []) => ({ _type: "span", _key: text.slice(0, 12), text, marks });
const p = (key: string, ...children: ReturnType<typeof span>[]) => ({
  _type: "block",
  _key: key,
  style: "normal",
  markDefs: [],
  children,
});

export const POST_BODY_SAMPLE = [
  {
    _type: "block",
    _key: "r1",
    style: "normal",
    markDefs: [
      { _type: "citation", _key: "c492", kind: "pep", id: "492" },
      { _type: "citation", _key: "c3156", kind: "pep", id: "3156" },
      { _type: "sidenote", _key: "sn1", note: "asyncio started life as “Tulip”, Guido van Rossum’s reference implementation for PEP 3156, and shipped provisionally in Python 3.4." },
      { _type: "citation", _key: "cco", kind: "wg21", id: "P0057R8" },
      { _type: "citation", _key: "cep", kind: "man", id: "epoll(7)" },
      { _type: "citation", _key: "cur", kind: "man", id: "io_uring_enter(2)" },
    ],
    children: [
      span("Python got "),
      span("async", ["code"]),
      span(" and "),
      span("await", ["code"]),
      span(" in "),
      span("PEP 492", ["c492"]),
      span(", on top of the event loop from "),
      span("PEP 3156", ["c3156"]),
      span(" (née Tulip)", ["sn1"]),
      span(". C++ took the same idea into the language with "),
      span("the Coroutines TS", ["cco"]),
      span(", and both end up waiting in "),
      span("epoll", ["cep"]),
      span(" or "),
      span("io_uring", ["cur"]),
      span("."),
    ],
  },
  p("p1", span("An "), span("await", ["code"]), span(" is a suspension point: the coroutine hands control back to the event loop, which goes back to waiting on the kernel.")),
  {
    _type: "code",
    _key: "c1",
    label: "In [1]:",
    language: "python",
    filename: "fetch.py",
    code: [
      "import asyncio",
      "",
      "async def fetch(reader: asyncio.StreamReader) -> bytes:",
      "    data = await reader.read(4096)  # [!code highlight]",
      "    return data",
    ].join("\n"),
    output: "b'HTTP/1.1 200 OK\\r\\n...'",
  },
  {
    _type: "codeTabs",
    _key: "t1",
    caption: "The same suspension, three layers down.",
    tabs: [
      {
        _key: "py",
        label: "Python",
        language: "python",
        code: ["async def handler():", "    data = await sock_recv(sock, 4096)  # [!code word:await]", "    return data"].join("\n"),
      },
      {
        _key: "cpp",
        label: "C++20",
        language: "cpp",
        filename: "handler.cpp",
        code: [
          "task<std::string> handler(socket& s) {",
          "    auto data = co_await s.async_read(4096); // [!code focus]",
          "    co_return data;",
          "}",
        ].join("\n"),
      },
      {
        _key: "c",
        label: "epoll",
        language: "c",
        code: [
          "struct epoll_event ev = { .events = EPOLLIN, .data.fd = fd };",
          "epoll_ctl(epfd, EPOLL_CTL_ADD, fd, &ev);",
          "int n = epoll_wait(epfd, events, 64, -1); // [!code highlight]",
        ].join("\n"),
      },
    ],
  },
  {
    _type: "code",
    _key: "c2",
    language: "python",
    filename: "Lib/asyncio/events.py",
    code: [
      "def get_event_loop():",
      "    loop = _get_running_loop()",
      "    if loop is None:",
      "        loop = get_event_loop_policy().get_event_loop()  # [!code --]",
      "        raise RuntimeError('no running event loop')  # [!code ++]",
      "    return loop",
    ].join("\n"),
  },
  {
    _type: "callout",
    _key: "k1",
    tone: "warning",
    title: "Blocking calls stall every task",
    body: [p("k1p", span("A synchronous "), span("time.sleep()", ["code"]), span(" inside a coroutine blocks the loop thread itself, so no other task runs until it returns."))],
  },
  {
    _type: "callout",
    _key: "k2",
    tone: "deep",
    title: "What epoll_wait actually does in the kernel",
    collapsed: true,
    body: [
      p("k2p", span("The thread sleeps on the epoll instance's wait queue. When a socket gets data, its wakeup callback moves the fd onto the ready list and wakes the waiter.")),
      { _type: "code", _key: "k2c", language: "strace", code: "epoll_wait(3, [{events=EPOLLIN, data={u32=7}}], 64, -1) = 1" },
    ],
  },
  {
    _type: "callout",
    _key: "k3",
    tone: "tip",
    body: [p("k3p", span("Run with "), span("PYTHONASYNCIODEBUG=1", ["code"]), span(" to log any callback that holds the loop for longer than 100 ms."))],
  },
];
