# Glynn Williams — eLearning & Instructional Design Portfolio

A dependency-free static portfolio site for Glynn Williams, designed for GitHub Pages. The visual system uses a command-burgundy light theme and science-blue dark theme, with restrained gold accents.

## Public site

Repository: `https://github.com/glynn-williams/glynn-williams.github.io`  
Expected GitHub Pages URL: `https://glynn-williams.github.io/`

The site is intentionally static: there is no framework, package manager, CDN, analytics script or build step. All production assets use relative paths so the project works beneath the GitHub Pages `/glynn-williams.github.io/` project path.

## 1. Put the site in `C:\Dev\Resume`

Extract or copy the finished site files into:

```text
C:\Dev\Resume
```

Open **Developer PowerShell**, then move to the site folder:

```powershell
Set-Location C:\Dev\Resume
Get-ChildItem
```

You should see `index.html`, `404.html`, `assets`, `tests`, `README.md`, `robots.txt`, and `sitemap.xml`.

## 2. Preview locally

From Developer PowerShell:

```powershell
Set-Location C:\Dev\Resume
py -m http.server 8000
```

If your machine does not have the Python launcher but `python` is on PATH, use:

```powershell
python -m http.server 8000
```

Open `http://localhost:8000/` in a browser. Stop the preview server with **Ctrl+C**.

## 3. Create the GitHub repository

The repository does not need to exist before you prepare the local folder.

1. Sign in to GitHub as **WeeJubya**.
2. Select **New repository**.
3. Set **Owner** to `WeeJubya`.
4. Set **Repository name** to `Resume`.
5. Set visibility to **Public** if you are using GitHub Free for GitHub Pages.
6. Leave **Add a README**, **Add .gitignore**, and **Choose a license** unchecked. The local project already contains the files it needs.
7. Select **Create repository**.

The repository address should then be:

`https://github.com/glynn-williams/glynn-williams.github.io`

## 4. Initialise the local repository and push it

For a fresh copy of the site with no `.git` folder, run the following in **Developer PowerShell**:

```powershell
Set-Location C:\Dev\Resume

git init
git add .
git commit -m "Initial portfolio site"
git branch -M main
git remote add origin https://github.com/glynn-williams/glynn-williams.github.io.git
git push -u origin main
```

If Git asks who you are before the first commit, configure your normal Git identity and retry the commit:

```powershell
git config --global user.name "Your Name"
git config --global user.email "your-email@example.com"
```

### If `C:\Dev\Resume` is already a Git repository

Do **not** run `git init` again. Check its current state first:

```powershell
Set-Location C:\Dev\Resume

git status
git branch --show-current
git remote -v
```

If there is no `origin` remote yet, add it:

```powershell
git remote add origin https://github.com/glynn-williams/glynn-williams.github.io.git
```

If `origin` exists but points somewhere else, change it deliberately:

```powershell
git remote set-url origin https://github.com/glynn-williams/glynn-williams.github.io.git
```

Then make sure the publishing branch is named `main` and push it:

```powershell
git branch -M main
git push -u origin main
```

## 5. Enable GitHub Pages

After the first push:

1. Open `https://github.com/glynn-williams/glynn-williams.github.io`.
2. Select **Settings**.
3. Select **Pages** in the repository settings sidebar.
4. Under **Build and deployment**, set **Source** to **Deploy from a branch**.
5. Set the branch to **main**.
6. Set the folder to **/(root)**.
7. Select **Save**.
8. Wait for the Pages deployment to finish, then select **Visit site**.

Expected public address:

`https://glynn-williams.github.io`

Because this is a project site rather than an account-root site, it is served beneath `/Resume/`. The production CSS, JavaScript and image links are therefore relative rather than root-absolute.

## 6. Run the verification tests

Node.js is needed only for the development checks, not for the published site.

```powershell
Set-Location C:\Dev\Resume
node --test tests/*.test.mjs
```

The tests check required files, section anchors, GitHub Pages pathing, theme helpers, the GNU Terry Pratchett meta tag, local images and basic public-data guardrails.

## 7. Publish later updates

After editing the site:

```powershell
Set-Location C:\Dev\Resume

git status
git add .
git commit -m "Update portfolio"
git push
```

GitHub Pages will redeploy the `main` branch automatically.

## GNU Terry Pratchett

Every HTML page includes:

```html
<meta http-equiv="X-Clacks-Overhead" content="GNU Terry Pratchett" />
```

## Public-content note

The repository intentionally excludes the source CV and PowerPoint portfolio. It also excludes the mobile telephone number, private address details and referee contact information from the supplied source documents.

## Preserve V1 before publishing V2

From Developer PowerShell:

```powershell
Set-Location C:\Dev\Resume
git status --short
git tag -a v1.0 -m "Resume portfolio V1"
git push origin v1.0
```

Only run the tag command while `HEAD` is the accepted V1 commit. If `v1.0` already exists, verify it instead of recreating it.

## Run the tests

```powershell
Set-Location C:\Dev\Resume
node --test tests\*.test.mjs
```

## V3 interface and interactive sample

V3 keeps the established visual system but reorganises the content around visitor intent. The seven hash-addressable tabs are: `#home`, `#about`, `#what-i-do`, `#experience`, `#portfolio`, `#testimonials`, and `#contact`. Browser Back and Forward can move between sections without a page reload.

The former Skills page is now **What I Do**, combining learning design, eLearning development, creative media and technical/development capability in context. Experience is more concise, Testimonials retain the complete source feedback, and Portfolio keeps both the ADP case study and the Renewable Energy interactive demonstration.

The Renewable Energy project still launches as a near-full-screen learning demonstration from the Portfolio tab. Its learning state is **session-only** and deliberately resets on refresh, exit, or restart. The knowledge check selects five questions from a ten-question bank and adds five renewable-type matching points. The score is therefore out of 10, with **8/10 = 80%** required to pass.

The published site remains dependency-free. There is **no build step** and no runtime package installation: GitHub Pages serves the HTML, CSS, JavaScript, and images directly from the repository root.

## Preserve V2 before publishing V3

From Developer PowerShell, while `main` is still the accepted V2 version:

```powershell
Set-Location C:\Dev\Resume
git branch v2-backup-2026-10-15
git push origin v2-backup-2026-10-15
```

## Publish V3 from Developer PowerShell

```powershell
Set-Location C:\Dev\Resume

node --test tests\*.test.mjs
git status

git add .
git commit -m "Release Resume portfolio V3"
git push origin main
```

The preview site is published from the repository root at `https://glynn-williams.github.io`.
