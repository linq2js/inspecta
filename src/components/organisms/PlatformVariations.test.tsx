import { render, screen } from '@testing-library/react'
import { PlatformVariations } from './PlatformVariations'
import type { UIComponent } from '@/types'

const baseComponent: UIComponent = {
  slug: 'test-button',
  name: 'Button',
  alternativeNames: [],
  platforms: ['ios', 'android'],
  category: 'input',
  description: 'A test component',
  anatomy: { parts: [] },
  placement: { position: 'inline', fixed: false, overlay: false, context: '' },
  behavior: {
    appears: '',
    interaction: '',
    dismissal: '',
    blocking: false,
    gestures: [],
  },
  platformVariations: [
    {
      platform: 'ios',
      name: 'UIButton',
      visualNotes: 'Rounded corners',
      behaviorNotes: 'Haptic feedback',
      referenceUrl: 'https://developer.apple.com/design/human-interface-guidelines/buttons',
    },
    {
      platform: 'android',
      name: 'Button (Material 3)',
      visualNotes: 'Filled variant',
      behaviorNotes: 'Ripple effect',
    },
  ],
}

describe('PlatformVariations', () => {
  it('should render all platform variations', () => {
    render(<PlatformVariations component={baseComponent} />)

    expect(screen.getByText('UIButton')).toBeInTheDocument()
    expect(screen.getByText('Button (Material 3)')).toBeInTheDocument()
  })

  it('should render a reference link when referenceUrl is provided', () => {
    render(<PlatformVariations component={baseComponent} />)

    const links = screen.getAllByRole('link')
    expect(links).toHaveLength(1)
    expect(links[0]).toHaveAttribute(
      'href',
      'https://developer.apple.com/design/human-interface-guidelines/buttons',
    )
    expect(links[0]).toHaveAttribute('target', '_blank')
    expect(links[0]).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('should not render a reference link when referenceUrl is absent', () => {
    const componentWithoutUrls: UIComponent = {
      ...baseComponent,
      platformVariations: [
        {
          platform: 'android',
          name: 'Button (Material 3)',
          visualNotes: 'Filled variant',
          behaviorNotes: 'Ripple effect',
        },
      ],
    }

    render(<PlatformVariations component={componentWithoutUrls} />)

    expect(screen.queryByRole('link')).not.toBeInTheDocument()
  })

  it('should display visual and behavior notes', () => {
    render(<PlatformVariations component={baseComponent} />)

    expect(screen.getByText('Rounded corners')).toBeInTheDocument()
    expect(screen.getByText('Haptic feedback')).toBeInTheDocument()
    expect(screen.getByText('Filled variant')).toBeInTheDocument()
    expect(screen.getByText('Ripple effect')).toBeInTheDocument()
  })
})
