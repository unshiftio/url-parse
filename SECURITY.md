# Security Guidelines

Please contact us directly at **security@3rd-Eden.com** for any bug that might
impact the security of this project. Please prefix the subject of your email
with `[security]` in lowercase and square brackets. Our email filters will
automatically prevent these messages from being moved to our spam box. All
emails that do not include security vulnerabilities will be removed and blocked
instantly.

In addition to a dedicated email address to receive security related reports,
we also have a [Hacker1 account][hacker1] that can be used for communicating
security related issues.

You will receive an acknowledgement of your report within **24 hours** of
notification.

## Exceptions

If you do not receive an acknowledgement within the said time frame please give
us the benefit of the doubt as it's possible that we haven't seen it yet. In
this case please send us a message **without details** using one of the
following methods:

- Give a poke on Twitter [@3rdEden](https://twitter.com/3rdEden)
- Contact the lead developers of this project on their personal e-mails. You
  can find the e-mails in the git logs, for example using the following command:
  `git --no-pager show -s --format='%an <%ae>' <gitsha>` where `<gitsha>` is the
  SHA1 of their latest commit in the project.

Once we have acknowledged receipt of your report and confirmed the bug
ourselves we will work with you to fix the vulnerability and publicly
acknowledge your responsible disclosure, if you wish.

## History

> Leading control characters are not removed. This allows an attacker to bypass
> hostname checks and makes the `extractProtocol` method return false positives.

- **Reporter credits**
  - Haxatron
  - GitHub: [@haxatron](https://github.com/haxatron)
  - Twitter: [@haxatron1](https://twitter.com/haxatron1)
- Huntr report: https://www.huntr.dev/bounties/57124ed5-4b68-4934-8325-2c546257f2e4/
- Fixed in: 1.5.9

---

> A URL with a specified but empty port can be used to bypass authorization
> checks.

- **Reporter credits**
  - Rohan Sharma
  - GitHub: [@r0hansh](https://github.com/r0hansh)
- Huntr report: https://www.huntr.dev/bounties/55fd06cd-9054-4d80-83be-eb5a454be78c/
- Fixed in: 1.5.8

---

> A specially crafted URL with empty userinfo and no host can be used to bypass
> authorization checks.

- **Reporter credits**
  - Haxatron
  - GitHub: [@haxatron](https://github.com/haxatron)
  - Twitter: [@haxatron1](https://twitter.com/haxatron1)
- Huntr report: https://www.huntr.dev/bounties/83a6bc9a-b542-4a38-82cd-d995a1481155/
- Fixed in: 1.5.7

---

> Incorrect handling of username and password can lead to authorization bypass.

- **Reporter credits**
  - ranjit-git
  - GitHub: [@ranjit-git](https://github.com/ranjit-git)
- Huntr report: https://www.huntr.dev/bounties/6d1bc51f-1876-4f5b-a2c2-734e09e8e05b/
- Fixed in: 1.5.6

---

> url-parse mishandles certain uses of a single (back) slash such as https:\ &
> https:/ and interprets the URI as a relative path. Browsers accept a single
> backslash after the protocol, and treat it as a normal slash, while url-parse
> sees it as a relative path.

- **Reporter credits**
  - ready-research
  - GitHub: [@ready-research](https://github.com/ready-research)
- Huntr report: https://www.huntr.dev/bounties/1625557993985-unshiftio/url-parse/
- Fixed in: 1.5.2

---

> Using backslash in the protocol is valid in the browser, while url-parse
> thinks it’s a relative path. An application that validates a url using
> url-parse might pass a malicious link.

- **Reporter credits**
  - CxSCA AppSec team at Checkmarx.
  - Twitter: [Yaniv Nizry](https://twitter.com/ynizry)
- Fixed in: 1.5.0

---

> The `extractProtocol` method does not return the correct protocol when
> provided with unsanitized content which could lead to false positives.

- **Reporter credits**
  - Reported through our security email & Twitter interaction.
  - Twitter: [@ronperris](https://twitter.com/ronperris)
- Fixed in: 1.4.5

---

> url-parse returns wrong hostname which leads to multiple vulnerabilities such
> as SSRF, Open Redirect, Bypass Authentication Protocol.

- **Reporter credits**
  - Hacker1: [lolwaleet](https://hackerone.com/lolwalee)
  - Twitter: [@ahm3dsec](https://twitter.com/ahm3dsec)
  - Blog: [0xahmed.ninja](https://0xahmed.ninja)
- Hacker1 report: https://hackerone.com/reports/384029
- Triaged by [Liran Tal](https://hackerone.com/lirantal)
- Fixed in: 1.4.3

---

[twitter]: https://twitter.com/3rdEden
[hacker1]: https://hackerone.com/3rdeden
