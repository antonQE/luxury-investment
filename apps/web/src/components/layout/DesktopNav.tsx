'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useId, useRef, useState } from 'react';

import { Link, usePathname } from '@/i18n/navigation';

import { PRIMARY_NAV } from './nav';

export function DesktopNav() {
  const pathname = usePathname();
  // Remount on route change so open menus reset without setState-in-effect.
  return <DesktopNavInner key={pathname} />;
}

function DesktopNavInner() {
  const t = useTranslations('Nav');
  const [openKey, setOpenKey] = useState<string | null>(null);
  const rootRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (openKey === null) return;
    const menuKey = openKey;

    function onPointerDown(event: MouseEvent) {
      const target = event.target;
      if (!(target instanceof Node) || rootRef.current === null) return;

      // Outside the whole nav → close.
      if (!rootRef.current.contains(target)) {
        setOpenKey(null);
        return;
      }

      // Inside nav but outside the open menu (e.g. another top tab) → close.
      const openMenu = rootRef.current.querySelector(`[data-nav-menu="${menuKey}"]`);
      if (openMenu !== null && !openMenu.contains(target)) {
        setOpenKey(null);
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpenKey(null);
    }

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [openKey]);

  function closeMenu() {
    setOpenKey(null);
  }

  // Logo already links home — skip "Начало" in the desktop strip to free space.
  const items = PRIMARY_NAV.filter((item) => !('href' in item && item.href === '/'));

  return (
    <nav
      ref={rootRef}
      className="hidden min-w-0 flex-1 items-center justify-center gap-x-2.5 overflow-visible px-1 xl:flex 2xl:gap-x-4"
      aria-label={t('mainNav')}
      data-testid="desktop-nav"
    >
      {items.map((item) =>
        'children' in item ? (
          <NavMenu
            key={item.key}
            menuKey={item.key}
            label={t(item.key)}
            testId={`nav-${item.key}`}
            open={openKey === item.key}
            onToggle={() => {
              setOpenKey((current) => (current === item.key ? null : item.key));
            }}
            onClose={closeMenu}
            childrenItems={item.children.map((child) => ({
              href: child.href,
              label: t(child.key),
              testId: `nav-${child.key}`,
            }))}
          />
        ) : (
          <Link
            key={item.href}
            href={item.href}
            className="shrink-0 whitespace-nowrap px-0.5 text-[13px] tracking-[0.02em] text-stone/80 transition hover:text-brass 2xl:text-[15px]"
            data-testid={`nav-${item.key}`}
            onClick={closeMenu}
          >
            {t(item.key)}
          </Link>
        ),
      )}
    </nav>
  );
}

function NavMenu({
  menuKey,
  label,
  testId,
  open,
  onToggle,
  onClose,
  childrenItems,
}: {
  menuKey: string;
  label: string;
  testId: string;
  open: boolean;
  onToggle: () => void;
  onClose: () => void;
  childrenItems: { href: string; label: string; testId: string }[];
}) {
  const menuId = useId();

  return (
    <div className="relative shrink-0" data-nav-menu={menuKey}>
      <button
        type="button"
        className="cursor-pointer whitespace-nowrap px-0.5 text-[13px] tracking-[0.02em] text-stone/80 transition hover:text-brass 2xl:text-[15px]"
        aria-expanded={open}
        aria-haspopup="true"
        aria-controls={menuId}
        data-testid={testId}
        onClick={(event) => {
          event.stopPropagation();
          onToggle();
        }}
      >
        {label}
      </button>
      {open ? (
        <div
          id={menuId}
          className="absolute left-0 top-full z-30 min-w-[12rem] pt-3"
          data-testid={`${testId}-submenu`}
          role="menu"
        >
          <ul className="border border-white/10 bg-void/95 py-2 backdrop-blur-md">
            {childrenItems.map((child) => (
              <li key={child.href} role="none">
                <Link
                  href={child.href}
                  role="menuitem"
                  className="block px-4 py-2.5 text-[14px] text-stone/80 transition hover:text-brass"
                  data-testid={child.testId}
                  onClick={onClose}
                >
                  {child.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
